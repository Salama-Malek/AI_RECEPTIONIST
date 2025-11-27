import { NotificationChannel, NotificationStatus } from '@prisma/client';

export class NotificationEntity {
  id!: string;
  channel!: NotificationChannel;
  destination!: string;
  subject?: string | null;
  message!: string;
  status!: NotificationStatus;
  error?: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<NotificationEntity>) {
    Object.assign(this, partial);
  }
}
