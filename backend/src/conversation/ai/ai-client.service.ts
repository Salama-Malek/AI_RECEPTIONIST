import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getReceptionistSystemPrompt } from '../prompts/system-prompt';
import { AiMessage, AiResponse } from './ai.types';
import { ConversationAction, ConversationIntent, ConversationUrgency } from '../types/conversation.types';

type GenerateOptions = {
  languageHint?: 'auto' | 'ar' | 'en' | 'ru';
  callerName: string;
  phoneNumber: string;
  context?: string;
  summary?: string;
};

@Injectable()
export class ConversationAiClient {
  private readonly logger = new Logger(ConversationAiClient.name);
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly receptionistName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4.1');
    this.receptionistName = this.configService.get<string>(
      'AI_RECEPTIONIST_NAME',
      'Salama AI Receptionist',
    );
  }

  async generateReply(history: AiMessage[], options: GenerateOptions): Promise<AiResponse> {
    if (this.apiKey) {
      try {
        return await this.callOpenAi(history, options);
      } catch (error) {
        this.logger.warn(
          { err: error },
          'OpenAI call failed, falling back to heuristic reply',
        );
      }
    }
    return this.generateHeuristicReply(history, options);
  }

  private async callOpenAi(history: AiMessage[], options: GenerateOptions): Promise<AiResponse> {
    const systemPrompt = getReceptionistSystemPrompt({ languageHint: options.languageHint }).replace(
      'Salama\'s AI Receptionist',
      this.receptionistName,
    );

    const messages: AiMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'system',
        content: `Caller: ${options.callerName} (${options.phoneNumber}). Context: ${options.context ?? 'n/a'}. Summary: ${options.summary ?? 'n/a'}.`,
      },
      ...history,
      { role: 'user', content: 'Provide your next concise reply following the format instructions.' },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI error: ${response.status} ${body}`);
    }

    const json = await response.json();
    const text: string = json.choices?.[0]?.message?.content ?? '';
    return this.parseModelResponse(text);
  }

  private generateHeuristicReply(history: AiMessage[], options: GenerateOptions): AiResponse {
    const lastUser = [...history].reverse().find((m) => m.role === 'user');
    const reply = lastUser
      ? `Thanks ${options.callerName || 'there'}, I noted: "${lastUser.content}". How urgent is this?`
      : `Hello, this is ${this.receptionistName}. How may I help you today?`;

    const actionSummary = this.deriveActions(lastUser?.content || '');
    return { reply, actionSummary };
  }

  private parseModelResponse(text: string): AiResponse {
    const lines = text.split('\n').map((l) => l.trim());
    let reply = '';
    let actionSummary: any = null;

    for (const line of lines) {
      if (line.toUpperCase().startsWith('REPLY')) {
        reply = line.replace(/^REPLY:\s*/i, '').trim();
      }
      if (line.toUpperCase().startsWith('ACTION')) {
        const raw = line.replace(/^ACTION:\s*/i, '').trim();
        try {
          actionSummary = JSON.parse(raw);
        } catch {
          this.logger.warn({ raw }, 'Failed to parse action summary JSON');
        }
      }
    }

    if (!reply) {
      reply = text.trim();
    }

    const derived = this.normalizeActionSummary(actionSummary ?? {});
    return { reply, actionSummary: derived };
  }

  private normalizeActionSummary(input: any): {
    intent: ConversationIntent;
    urgency: ConversationUrgency;
    notes?: string;
    action?: ConversationAction['type'];
  } {
    const intent: ConversationIntent =
      input.intent && ['info_request', 'schedule_callback', 'spam', 'emergency', 'other'].includes(input.intent)
        ? input.intent
        : 'other';
    const urgency: ConversationUrgency =
      input.urgency && ['low', 'medium', 'high'].includes(input.urgency) ? input.urgency : 'medium';
    const action: ConversationAction['type'] =
      input.action && ['create_task', 'send_notification', 'mark_spam', 'none'].includes(input.action)
        ? input.action
        : intent === 'spam'
          ? 'mark_spam'
          : intent === 'emergency'
            ? 'send_notification'
            : 'none';
    return {
      intent,
      urgency,
      notes: input.notes || '',
      action,
    };
  }

  private deriveActions(text: string): {
    intent: ConversationIntent;
    urgency: ConversationUrgency;
    notes?: string;
    action?: ConversationAction['type'];
  } {
    const lower = text.toLowerCase();
    if (lower.includes('spam') || lower.includes('offer') || lower.includes('sales')) {
      return { intent: 'spam', urgency: 'low', notes: 'Flagged as spam', action: 'mark_spam' };
    }
    if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('hospital')) {
      return { intent: 'emergency', urgency: 'high', notes: 'Possible emergency', action: 'send_notification' };
    }
    if (lower.includes('schedule') || lower.includes('book')) {
      return { intent: 'schedule_callback', urgency: 'medium', notes: 'Scheduling intent', action: 'create_task' };
    }
    return { intent: 'info_request', urgency: 'medium', notes: 'General info', action: 'none' };
  }
}
