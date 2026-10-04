import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaveRequestService } from '../services/leave-request.service';
import { CreateLeaveRequestDto } from '../dto/leave-request/create-leave-request.dto';

@ApiTags('Leave Requests')
@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new leave request' })
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveRequestService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave requests' })
  findAll() {
    return this.leaveRequestService.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get leave history by employee' })
  getEmployeeHistory(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.leaveRequestService.getEmployeeHistory(employeeId);
  }

  @Get('employee/:employeeId/balance')
  @ApiOperation({ summary: 'Get leave balance by employee' })
  getEmployeeBalance(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.leaveRequestService.getEmployeeBalance(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave request by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leaveRequestService.findOne(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a leave request' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.leaveRequestService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a leave request' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.leaveRequestService.reject(id);
  }
}