import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaveTypeService } from '../services/leave-type.service';
import { CreateLeaveTypeDto } from '../dto/leave-type/create-leave-type.dto';
import { UpdateLeaveTypeDto } from '../dto/leave-type/update-leave-type.dto';

@ApiTags('Leave Types')
@Controller('leave-types')
export class LeaveTypeController {
  constructor(private readonly leaveTypeService: LeaveTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leave type' })
  create(@Body() dto: CreateLeaveTypeDto) {
    return this.leaveTypeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave types' })
  findAll() {
    return this.leaveTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave type by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leaveTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update leave type' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveTypeDto,
  ) {
    return this.leaveTypeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete leave type' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leaveTypeService.remove(id);
  }
}