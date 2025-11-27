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
