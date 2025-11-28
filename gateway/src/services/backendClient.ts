import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const http = axios.create({
  baseURL: config.BACKEND_API_BASE_URL,
  timeout: config.BACKEND_API_TIMEOUT_MS,
});

export type StartConversationParams = {
  callerName?: string;
  phoneNumber?: string;
  languageHint?: 'auto' | 'ar' | 'en' | 'ru';
  context?: string;
};

export type StartConversationResponse = {
  conversationId: string;
  initialAssistantMessage: string;
  meta?: any;
};

export type SendMessageParams = {
  conversationId: string;
  from: 'caller' | 'assistant';
  text: string;
};

export type SendMessageResponse = {
  reply: string;
  actions?: any[];
  updatedSummary?: string;
};

async function startConversation(
  params: StartConversationParams,
): Promise<StartConversationResponse> {
  const { data } = await http.post<StartConversationResponse>('/conversation/start', params);
  return data;
}

async function sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
  const { data } = await http.post<SendMessageResponse>('/conversation/message', params);
  return data;
}

export const backendClient = {
  startConversation: async (params: StartConversationParams) => {
    try {
      const res = await startConversation(params);
      logger.info(
        { conversationId: res.conversationId, languageHint: params.languageHint },
        'Conversation started with backend',
      );
      return res;
    } catch (error) {
      logger.error({ err: error }, 'Failed to start conversation with backend');
      throw error;
    }
  },
  sendMessage: async (params: SendMessageParams) => {
    try {
      const res = await sendMessage(params);
      logger.debug(
        { conversationId: params.conversationId },
        'Conversation message processed by backend',
      );
      return res;
    } catch (error) {
      logger.error({ err: error }, 'Failed to send message to backend');
      throw error;
    }
  },
};
