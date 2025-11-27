import { CallDirection, CallStatus, TaskResult } from '@prisma/client';

export class CallEntity {
  id!: string;
  fromNumber!: string;
  toNumber!: string;
  provider!: string;
  direction!: CallDirection;
  status!: CallStatus;
  transcript?: string | null;
  summary?: string | null;
  metadata?: Record<string, any> | null;
  taskResults?: TaskResult[];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<CallEntity>) {
    Object.assign(this, partial);
  }
}
