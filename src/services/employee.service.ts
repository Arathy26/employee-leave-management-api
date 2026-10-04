import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from '../dto/employee/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/employee/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  // Create new employee
  async create(dto: CreateEmployeeDto) {
    // Check if employee_code already exists
    const existing = await this.prisma.employee.findUnique({
      where: { employee_code: dto.employee_code },
    });
    if (existing) {
      throw new ConflictException('Employee code already exists');
    }

    return this.prisma.employee.create({
      data: {
        employee_code: dto.employee_code,
        name: dto.name,
        email: dto.email,
        department: dto.department,
        joining_date: new Date(dto.joining_date),
      },
    });
  }

  // Get all employees
  async findAll() {
    return this.prisma.employee.findMany();
  }

  // Get one employee by id
  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  // Update employee
  async update(id: number, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: dto,
    });
  }

  // Delete employee
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}