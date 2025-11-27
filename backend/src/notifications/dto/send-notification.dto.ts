import { NotificationChannel } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;
}
