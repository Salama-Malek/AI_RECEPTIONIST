import { IsOptional, IsString } from 'class-validator';

export class IncomingCallDto {
  @IsString()
  CallSid!: string;

  @IsString()
  From!: string;

  @IsString()
  To!: string;

  @IsOptional()
  @IsString()
  CallStatus?: string;

  @IsOptional()
  @IsString()
  Direction?: string;
}
