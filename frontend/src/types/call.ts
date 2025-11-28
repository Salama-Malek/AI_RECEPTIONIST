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

export type CallSummary = {
  id: string;
  callSid?: string;
  fromNumber: string;
  callerName?: string;
  startedAt: string;
  durationSeconds?: number;
  status: 'open' | 'handled' | 'spam';
  urgency: 'low' | 'medium' | 'high';
};

export type CallDetails = CallSummary & {
  transcript: TranscriptEntry[];
  summary?: string;
  notes?: string;
};
