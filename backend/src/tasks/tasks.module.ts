import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { CallsModule } from '../calls/calls.module';

@Module({
  imports: [CallsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
