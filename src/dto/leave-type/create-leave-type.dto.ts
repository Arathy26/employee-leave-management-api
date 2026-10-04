import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveTypeDto {
  @ApiProperty({ example: 'Annual Leave' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Yearly leave entitlement' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 14 })
  @IsNumber()
  @IsNotEmpty()
  annual_limit: number;
}