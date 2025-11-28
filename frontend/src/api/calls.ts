import { apiClient } from './client';
import { CallDetails, CallSummary } from '../types/call';

export async function fetchCalls(): Promise<CallSummary[]> {
  try {
    const { data } = await apiClient.get<CallSummary[]>('/calls');
    return data;
  } catch (error) {
    console.warn('Falling back to mock calls', error);
    return mockCalls;
  }
}

export async function fetchCallById(callId: string): Promise<CallDetails> {
  try {
    const { data } = await apiClient.get<CallDetails>(`/calls/${callId}`);
    return data;
  } catch (error) {
    console.warn('Falling back to mock call detail', error);
    const fallback = mockCalls.find((c) => c.id === callId) || mockCalls[0];
    return { ...fallback, transcript: mockTranscript, summary: fallback.summary };
  }
}

export async function updateCallStatus(
  callId: string,
  status: 'handled' | 'spam' | 'open',
): Promise<void> {
  try {
    await apiClient.patch(`/calls/${callId}/status`, { status });
  } catch (error) {
    console.warn('Mocking call status update', error);
  }
}

const mockCalls: CallSummary[] = [
  {
    id: 'call_1',
    callSid: 'CA123',
    fromNumber: '+971501234567',
    callerName: 'Amira Hassan',
    startedAt: new Date().toISOString(),
    durationSeconds: 180,
    status: 'handled',
    urgency: 'medium',
  },
  {
    id: 'call_2',
    callSid: 'CA456',
    fromNumber: '+12065550111',
    callerName: 'Unknown',
    startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    durationSeconds: 45,
    status: 'open',
    urgency: 'high',
  },
];

const mockTranscript = [
  { id: 't1', role: 'caller', text: 'Hello, I need to book an appointment.', timestamp: new Date().toISOString() },
  { id: 't2', role: 'assistant', text: 'Sure, what day works best for you?', timestamp: new Date().toISOString() },
];
