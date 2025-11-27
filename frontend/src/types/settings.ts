export type NotificationChannel = 'telegram' | 'email';

export type Settings = {
  busyMode: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  notifications: NotificationChannel[];
};
