import { IsOptional, IsString } from 'class-validator';

export class TwilioWebhookDto {
  @IsString()
  CallSid!: string;

  @IsString()
  From!: string;

  @IsString()
  To!: string;

  @IsString()
  CallStatus!: string;

  @IsOptional()
  @IsString()
  Direction?: string;

  @IsOptional()
  @IsString()
  SpeechResult?: string;
}
