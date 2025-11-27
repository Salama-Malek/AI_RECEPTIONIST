import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    const status = dto.status ?? TaskStatus.PENDING;
    return this.prisma.taskResult.create({
      data: { ...dto, status },
    });
  }

  async findAll() {
    return this.prisma.taskResult.findMany({
      orderBy: { createdAt: 'desc' },
      include: { call: true },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.taskResult.findUnique({
      where: { id },
      include: { call: true },
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);
    return this.prisma.taskResult.update({ where: { id }, data: dto });
  }

  async markStatus(id: string, status: TaskStatus, error?: string) {
    await this.findOne(id);
    return this.prisma.taskResult.update({
      where: { id },
      data: { status, error },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.taskResult.delete({ where: { id } });
  }
}
