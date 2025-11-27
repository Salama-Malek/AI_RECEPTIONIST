import { TaskStatus } from '@prisma/client';

export class TaskEntity {
  id!: string;
  callId?: string | null;
  name!: string;
  status!: TaskStatus;
  payload?: Record<string, any> | null;
  error?: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<TaskEntity>) {
    Object.assign(this, partial);
  }
}
