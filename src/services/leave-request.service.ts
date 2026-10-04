import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from '../dto/leave-request/create-leave-request.dto';

@Injectable()
export class LeaveRequestService {
  constructor(private readonly prisma: PrismaService) {}

  // Create new leave request
  async create(dto: CreateLeaveRequestDto) {
    // Rule 1: Employee must exist
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employee_id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${dto.employee_id} not found`);
    }

    // Rule 2: Leave type must exist
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: dto.leave_type_id },
    });
    if (!leaveType) {
      throw new NotFoundException(`Leave type with id ${dto.leave_type_id} not found`);
    }

    // Rule 3: start_date must not be after end_date
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);
    if (startDate > endDate) {
      throw new BadRequestException('start_date cannot be after end_date');
    }

    // Rule 4: Calculate requested days
    const requestedDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

    // Rule 5: Check overlapping leaves
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        employee_id: dto.employee_id,
        leave_type_id: dto.leave_type_id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            start_date: { lte: endDate },
            end_date: { gte: startDate },
          },
        ],
      },
    });
    if (overlap) {
      throw new ConflictException('Employee already has overlapping leave request');
    }

    // Rule 6: Check balance
    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        employee_id: dto.employee_id,
        leave_type_id: dto.leave_type_id,
        status: 'APPROVED',
      },
    });

    const usedDays = approvedLeaves.reduce((total, leave) => {
      const days = Math.ceil(
        (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
      ) + 1;
      return total + days;
    }, 0);

    const remainingBalance = leaveType.annual_limit - usedDays;
    if (requestedDays > remainingBalance) {
      throw new BadRequestException(
        `Insufficient balance. Requested: ${requestedDays} days, Available: ${remainingBalance} days`,
      );
    }

    // All rules passed — save as PENDING
    return this.prisma.leaveRequest.create({
      data: {
        employee_id: dto.employee_id,
        leave_type_id: dto.leave_type_id,
        start_date: startDate,
        end_date: endDate,
        reason: dto.reason,
        status: 'PENDING',
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });
  }

  // Get all leave requests
  async findAll() {
    return this.prisma.leaveRequest.findMany({
      include: { employee: true, leaveType: true },
    });
  }

  // Get one leave request
  async findOne(id: number) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true, leaveType: true },
    });
    if (!request) {
      throw new NotFoundException(`Leave request with id ${id} not found`);
    }
    return request;
  }

  // Approve leave request
  async approve(id: number) {
    const request = await this.findOne(id);
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING requests can be approved');
    }
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { employee: true, leaveType: true },
    });
  }

  // Reject leave request
  async reject(id: number) {
    const request = await this.findOne(id);
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING requests can be rejected');
    }
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { employee: true, leaveType: true },
    });
  }

  // Get leave history by employee
  async getEmployeeHistory(employeeId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${employeeId} not found`);
    }
    return this.prisma.leaveRequest.findMany({
      where: { employee_id: employeeId },
      include: { leaveType: true },
    });
  }

  // Get leave balance by employee
  async getEmployeeBalance(employeeId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${employeeId} not found`);
    }

    const leaveTypes = await this.prisma.leaveType.findMany();

    const balance = await Promise.all(
      leaveTypes.map(async (leaveType) => {
        const approvedLeaves = await this.prisma.leaveRequest.findMany({
          where: {
            employee_id: employeeId,
            leave_type_id: leaveType.id,
            status: 'APPROVED',
          },
        });

        const usedDays = approvedLeaves.reduce((total, leave) => {
          const days = Math.ceil(
            (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) /
            (1000 * 60 * 60 * 24),
          ) + 1;
          return total + days;
        }, 0);

        return {
          leave_type: leaveType.name,
          annual_limit: leaveType.annual_limit,
          used_days: usedDays,
          remaining_days: leaveType.annual_limit - usedDays,
        };
      }),
    );

    return {
      employee_name: employee.name,
      employee_code: employee.employee_code,
      balance,
    };
  }
}