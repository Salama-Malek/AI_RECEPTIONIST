import { ConversationAction, ConversationIntent, ConversationUrgency } from '../types/conversation.types';

export type AiMessageRole = 'system' | 'user' | 'assistant';

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type AiActionSummary = {
  intent: ConversationIntent;
  urgency: ConversationUrgency;
  notes?: string;
  action?: ConversationAction['type'];
};

export type AiResponse = {
  reply: string;
  actionSummary: AiActionSummary;
};
