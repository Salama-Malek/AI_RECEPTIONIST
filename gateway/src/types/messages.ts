export type InitMessage = {
  type: 'init';
  callId: string;
  languageHint?: 'auto' | 'ar' | 'en' | 'ru';
};

export type AudioInMessage = {
  type: 'audio';
  callId: string;
  chunk: string; // base64-encoded PCM 16k mono
};

export type IncomingMessage = InitMessage | AudioInMessage;

export type AudioOutMessage = {
  type: 'audio_out';
  callId: string;
  chunk: string; // base64-encoded PCM for playback
};

export type TranscriptMessage = {
  type: 'transcript';
  callId: string;
  role: 'caller' | 'assistant';
  text: string;
};

export type ErrorMessage = {
  type: 'error';
  callId?: string;
  message: string;
};

export type OutgoingMessage =
  | AudioOutMessage
  | TranscriptMessage
  | ErrorMessage
  | { type: 'ready'; callId: string };

// Twilio Media Stream events
export type TwilioStreamStartEvent = {
  event: 'start';
  start: {
    streamSid: string;
    callSid: string;
    accountSid: string;
  };
};

export type TwilioStreamMediaEvent = {
  event: 'media';
  media: {
    streamSid: string;
    payload: string; // base64-encoded audio frame (Twilio I-law 8kHz)
  };
};

export type TwilioStreamStopEvent = {
  event: 'stop';
  stop: {
    streamSid: string;
  };
};

export type TwilioStreamEventUnion =
  | TwilioStreamStartEvent
  | TwilioStreamMediaEvent
  | TwilioStreamStopEvent;

export type GatewaySession = {
  streamSid: string;
  callSid?: string;
  conversationId?: string;
  createdAt: number;
  lastActivityAt: number;
  languageHint?: string;
};

export type GatewayOutboundMessage =
  | TranscriptMessage
  | AudioOutMessage
  | ErrorMessage;
