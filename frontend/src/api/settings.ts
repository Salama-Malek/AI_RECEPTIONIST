import { apiClient } from './client';
import { Settings } from '../types/settings';

const mockSettings: Settings = {
  busyMode: false,
  workingHours: { start: '09:00', end: '18:00' },
  notifications: ['telegram', 'email'],
};

export async function getSettings(): Promise<Settings> {
  try {
    const { data } = await apiClient.get<Settings>('/settings');
    return data;
  } catch (error) {
    console.warn('Falling back to mock settings', error);
    return mockSettings;
  }
}

export async function updateSettings(input: Settings): Promise<Settings> {
  try {
    const { data } = await apiClient.patch<Settings>('/settings', input);
    return data;
  } catch (error) {
    console.warn('Using mock settings update', error);
    Object.assign(mockSettings, input);
    return mockSettings;
  }
}
