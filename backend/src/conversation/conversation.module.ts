import { Module, forwardRef } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationAiClient } from './ai/ai-client.service';
import { CallsModule } from '../calls/calls.module';
import { TasksModule } from '../tasks/tasks.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CallsModule, forwardRef(() => TasksModule), NotificationsModule],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationAiClient],
  exports: [ConversationService],
})
export class ConversationModule {}
