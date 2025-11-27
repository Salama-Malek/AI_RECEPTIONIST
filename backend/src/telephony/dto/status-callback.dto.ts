import { IsOptional, IsString } from 'class-validator';

export class StatusCallbackDto {
  @IsString()
  CallSid!: string;

  @IsOptional()
  @IsString()
  CallStatus?: string;

  @IsOptional()
  @IsString()
  From?: string;

  @IsOptional()
  @IsString()
  To?: string;

  @IsOptional()
  @IsString()
  Duration?: string;
}
