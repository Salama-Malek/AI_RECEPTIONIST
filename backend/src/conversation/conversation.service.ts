import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConversationAiClient } from './ai/ai-client.service';
import {
  ConversationAction,
  ConversationMessage,
  ConversationState,
} from './types/conversation.types';
import { StartConversationDto } from './dto/start-conversation.dto';
import { MessageDto } from './dto/message.dto';
import { getReceptionistSystemPrompt } from './prompts/system-prompt';
import { randomUUID } from 'crypto';
import { AiMessage } from './ai/ai.types';
import { TasksService } from '../tasks/tasks.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationChannel } from '@prisma/client';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private readonly sessions = new Map<string, ConversationState>();

  constructor(
    private readonly aiClient: ConversationAiClient,
    private readonly tasksService?: TasksService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  async startConversation(dto: StartConversationDto) {
    const id = randomUUID();
    const systemPrompt = getReceptionistSystemPrompt({ languageHint: dto.languageHint });

    const state: ConversationState = {
      id,
      callerName: dto.callerName,
      phoneNumber: dto.phoneNumber,
      languageHint: dto.languageHint ?? 'auto',
      context: dto.context,
      history: [
        {
          id: randomUUID(),
          role: 'system',
          text: systemPrompt,
          timestamp: new Date().toISOString(),
        },
      ],
      summary: '',
    };

    const initialHistory: AiMessage[] = this.toAiMessages(state, {
      includeSystem: true,
      context: dto.context,
    });

    const aiResult = await this.aiClient.generateReply(initialHistory, {
      languageHint: dto.languageHint,
      callerName: dto.callerName,
      phoneNumber: dto.phoneNumber,
      context: dto.context,
      summary: state.summary,
    });

    const assistantMessage: ConversationMessage = {
      id: randomUUID(),
      role: 'assistant',
      text: aiResult.reply,
      timestamp: new Date().toISOString(),
    };

    state.history.push(assistantMessage);
    state.summary = aiResult.actionSummary?.notes || 'Conversation started';
    this.sessions.set(id, state);

    await this.applyActions(id, aiResult.actionSummary?.action, aiResult.actionSummary?.notes);

    return {
      conversationId: id,
      initialAssistantMessage: aiResult.reply,
      meta: {
        languageHint: dto.languageHint ?? 'auto',
        timestamp: new Date().toISOString(),
      },
    };
  }

  async handleMessage(dto: MessageDto) {
    const state = this.sessions.get(dto.conversationId);
    if (!state) {
      throw new NotFoundException(`Conversation ${dto.conversationId} not found`);
    }

    const userMessage: ConversationMessage = {
      id: randomUUID(),
      role: dto.from,
      text: dto.text,
      timestamp: new Date().toISOString(),
    };
    state.history.push(userMessage);

    const aiHistory = this.toAiMessages(state, { includeSystem: true, context: state.context });
    const aiResult = await this.aiClient.generateReply(aiHistory, {
      languageHint: state.languageHint,
      callerName: state.callerName,
      phoneNumber: state.phoneNumber,
      context: state.context,
      summary: state.summary,
    });

    const assistantMessage: ConversationMessage = {
      id: randomUUID(),
      role: 'assistant',
      text: aiResult.reply,
      timestamp: new Date().toISOString(),
    };
    state.history.push(assistantMessage);
    state.summary = aiResult.actionSummary?.notes || state.summary;

    await this.applyActions(state.id, aiResult.actionSummary?.action, aiResult.actionSummary?.notes);

    return {
      reply: aiResult.reply,
      actions: aiResult.actionSummary?.action
        ? [this.toConversationAction(aiResult.actionSummary.action, aiResult.actionSummary.notes)]
        : [],
      updatedSummary: state.summary,
    };
  }

  private toAiMessages(
    state: ConversationState,
    options: { includeSystem?: boolean; context?: string },
  ): AiMessage[] {
    const messages: AiMessage[] = [];
    if (options.includeSystem) {
      const system = state.history.find((h) => h.role === 'system');
      if (system) {
        messages.push({ role: 'system', content: system.text });
      }
      messages.push({
        role: 'system',
        content: `Caller: ${state.callerName} (${state.phoneNumber}). Context: ${
          options.context ?? state.context ?? 'n/a'
        }. Summary: ${state.summary || 'n/a'}.`,
      });
    }

    for (const msg of state.history) {
      if (msg.role === 'system') continue;
      messages.push({
        role: msg.role === 'caller' ? 'user' : 'assistant',
        content: msg.text,
      });
    }
    return messages;
  }

  private toConversationAction(
    action: ConversationAction['type'],
    notes?: string,
  ): ConversationAction {
    switch (action) {
      case 'create_task':
        return { type: 'create_task', payload: { notes } };
      case 'send_notification':
        return { type: 'send_notification', payload: { notes } };
      case 'mark_spam':
        return { type: 'mark_spam', payload: { notes } };
      default:
        return { type: 'none', payload: {} };
    }
  }

  private async applyActions(conversationId: string, action?: ConversationAction['type'], notes?: string) {
    if (!action || action === 'none') return;
    this.logger.log({ conversationId, action }, 'Applying conversation action');

    if (action === 'create_task' && this.tasksService) {
      await this.tasksService.create({
        name: `Follow-up for conversation ${conversationId}`,
        payload: { notes, conversationId },
      });
    }

    if (action === 'send_notification' && this.notificationsService) {
      await this.notificationsService.send({
        channel: NotificationChannel.TELEGRAM,
        message: notes || `Urgent follow-up for conversation ${conversationId}`,
      });
    }

    if (action === 'mark_spam') {
      this.logger.warn({ conversationId }, 'Conversation marked as spam');
    }
  }
}
