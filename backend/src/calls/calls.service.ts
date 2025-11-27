import { Injectable, NotFoundException } from '@nestjs/common';
import { CallDirection, CallStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

@Injectable()
export class CallsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCallDto) {
    return this.prisma.callLog.create({ data: dto });
  }

  async findAll() {
    return this.prisma.callLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { taskResults: true },
    });
  }

  async findOne(id: string) {
    const call = await this.prisma.callLog.findUnique({
      where: { id },
      include: { taskResults: true },
    });
    if (!call) {
      throw new NotFoundException(`Call ${id} not found`);
    }
    return call;
  }

  async update(id: string, dto: UpdateCallDto) {
    await this.findOne(id);
    return this.prisma.callLog.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.callLog.delete({ where: { id } });
  }

  async logProviderEvent(input: {
    provider: string;
    fromNumber: string;
    toNumber: string;
    direction: CallDirection;
    status: CallStatus;
    transcript?: string;
    summary?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.callLog.create({
      data: {
        provider: input.provider,
        fromNumber: input.fromNumber,
        toNumber: input.toNumber,
        direction: input.direction,
        status: input.status,
        transcript: input.transcript,
        summary: input.summary,
        metadata: input.metadata,
      },
    });
  }
}
