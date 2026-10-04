import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveTypeDto } from '../dto/leave-type/create-leave-type.dto';
import { UpdateLeaveTypeDto } from '../dto/leave-type/update-leave-type.dto';

@Injectable()
export class LeaveTypeService {
  constructor(private readonly prisma: PrismaService) {}

  // Create new leave type
  async create(dto: CreateLeaveTypeDto) {
    const existing = await this.prisma.leaveType.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Leave type name already exists');
    }
    return this.prisma.leaveType.create({
      data: dto,
    });
  }

  // Get all leave types
  async findAll() {
    return this.prisma.leaveType.findMany();
  }

  // Get one leave type by id
  async findOne(id: number) {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id },
    });
    if (!leaveType) {
      throw new NotFoundException(`Leave type with id ${id} not found`);
    }
    return leaveType;
  }

  // Update leave type
  async update(id: number, dto: UpdateLeaveTypeDto) {
    await this.findOne(id);
    return this.prisma.leaveType.update({
      where: { id },
      data: dto,
    });
  }

  // Delete leave type
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.leaveType.delete({
      where: { id },
    });
  }
}