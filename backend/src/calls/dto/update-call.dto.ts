import { CallDirection, CallStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCallDto {
  @IsOptional()
  @IsString()
  fromNumber?: string;

  @IsOptional()
  @IsString()
  toNumber?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsEnum(CallDirection)
  direction?: CallDirection;

  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
