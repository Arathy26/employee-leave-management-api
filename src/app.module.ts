import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './modules/employee.module';
import { LeaveTypeModule } from './modules/leave-type.module';
import { LeaveRequestModule } from './modules/leave-request.module';

@Module({
  imports: [
    PrismaModule,
    EmployeeModule,
    LeaveTypeModule,
    LeaveRequestModule,
  ],
})
export class AppModule {}