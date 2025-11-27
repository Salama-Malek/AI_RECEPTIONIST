import { CallDirection, CallStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCallDto {
  @IsString()
  fromNumber: string;

  @IsString()
  toNumber: string;

  @IsString()
  provider: string;

  @IsEnum(CallDirection)
  direction: CallDirection;

  @IsEnum(CallStatus)
  status: CallStatus;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
