import { Module } from '@nestjs/common';
import { LeaveTypeController } from '../controllers/leave-type.controller';
import { LeaveTypeService } from '../services/leave-type.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LeaveTypeController],
  providers: [LeaveTypeService],
})
export class LeaveTypeModule {}