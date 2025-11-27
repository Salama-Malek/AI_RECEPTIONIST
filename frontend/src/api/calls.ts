import { apiClient } from './client';
import { Call, CallStatus } from '../types/call';

const mockCalls: Call[] = [
  {
    id: 'call_1',
    callerName: 'Amira Hassan',
    fromNumber: '+971501234567',
    toNumber: '+18005550123',
    startedAt: new Date().toISOString(),
    status: 'completed',
    urgency: 'normal',
    summary: 'Patient requested appointment for next week.',
    transcript: [
      { id: 't1', role: 'caller', text: 'Hello, I need to book an appointment.', timestamp: new Date().toISOString() },
      { id: 't2', role: 'assistant', text: 'Sure, which day works for you?', timestamp: new Date().toISOString() },
    ],
  },
  {
    id: 'call_2',
    callerName: 'Unknown',
    fromNumber: '+12065550111',
    toNumber: '+18005550123',
    startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    urgency: 'high',
    summary: 'Caller is upset about billing error.',
    transcript: [
      { id: 't3', role: 'caller', text: 'I was overcharged.', timestamp: new Date().toISOString() },
      { id: 't4', role: 'assistant', text: 'Let me check your account.', timestamp: new Date().toISOString() },
    ],
  },
];

export async function getCalls(): Promise<Call[]> {
  try {
    const { data } = await apiClient.get<Call[]>('/calls');
    return data;
  } catch (error) {
    console.warn('Falling back to mock calls', error);
    return mockCalls;
  }
}

export async function getCallById(id: string): Promise<Call> {
  try {
    const { data } = await apiClient.get<Call>(`/calls/${id}`);
    return data;
  } catch (error) {
    const fallback = mockCalls.find((c) => c.id === id) || mockCalls[0];
    return fallback;
  }
}

export async function updateCallStatus(id: string, status: CallStatus): Promise<Call> {
  try {
    const { data } = await apiClient.patch<Call>(`/calls/${id}/status`, { status });
    return data;
  } catch (error) {
    const existing = await getCallById(id);
    return { ...existing, status };
  }
}
