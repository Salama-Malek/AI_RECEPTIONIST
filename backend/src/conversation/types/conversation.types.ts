export type ConversationMessageRole = 'system' | 'caller' | 'assistant';

export type ConversationMessage = {
  id: string;
  role: ConversationMessageRole;
  text: string;
  timestamp: string;
};

export type ConversationIntent =
  | 'info_request'
  | 'schedule_callback'
  | 'spam'
  | 'emergency'
  | 'other';

export type ConversationUrgency = 'low' | 'medium' | 'high';

export type ConversationAction =
  | { type: 'create_task'; payload: any }
  | { type: 'send_notification'; payload: any }
  | { type: 'mark_spam'; payload?: any }
  | { type: 'none'; payload?: any };

export type ConversationState = {
  id: string;
  callerName: string;
  phoneNumber: string;
  languageHint?: 'auto' | 'ar' | 'en' | 'ru';
  context?: string;
  history: ConversationMessage[];
  summary?: string;
};
