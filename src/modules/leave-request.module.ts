import { Module } from '@nestjs/common';
import { LeaveRequestController } from '../controllers/leave-request.controller';
import { LeaveRequestService } from '../services/leave-request.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LeaveRequestController],
  providers: [LeaveRequestService],
})
export class LeaveRequestModule {}