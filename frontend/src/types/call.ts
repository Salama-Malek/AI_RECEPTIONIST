export type CallStatus = 'received' | 'in_progress' | 'completed' | 'failed' | 'spam';
export type CallUrgency = 'low' | 'normal' | 'high';

export type TranscriptEntry = {
  id: string;
  role: 'caller' | 'assistant';
  text: string;
  timestamp: string;
};

export type Call = {
  id: string;
  callerName: string;
  fromNumber: string;
  toNumber: string;
  startedAt: string;
  endedAt?: string;
  status: CallStatus;
  urgency: CallUrgency;
  summary: string;
  transcript: TranscriptEntry[];
};
