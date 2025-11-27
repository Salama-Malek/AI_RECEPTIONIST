import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class TelnyxPayloadDto {
  @IsOptional()
  @IsString()
  call_control_id?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  direction?: string;
}

class TelnyxDataDto {
  @IsString()
  event_type: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TelnyxPayloadDto)
  payload?: TelnyxPayloadDto;
}

export class TelnyxWebhookDto {
  @ValidateNested()
  @Type(() => TelnyxDataDto)
  data: TelnyxDataDto;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}
