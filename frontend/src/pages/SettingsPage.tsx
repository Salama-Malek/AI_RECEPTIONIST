import { FormEvent, useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getSettings, updateSettings } from '../api/settings';
import { Settings } from '../types/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getSettings();
      setSettings(data);
    })();
  }, []);

  const toggleNotification = (channel: string) => {
    if (!settings) return;
    const next = settings.notifications.includes(channel as any)
      ? settings.notifications.filter((c) => c !== channel)
      : [...settings.notifications, channel as any];
    setSettings({ ...settings, notifications: next });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await updateSettings(settings);
    setSaving(false);
  };

  if (!settings) {
    return <div className="text-slate-300">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="text-sm text-slate-400">Configure busy mode, hours, and notifications</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Availability">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-200">Busy Mode</div>
              <div className="text-xs text-slate-500">
                Route calls to voicemail or queue
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={settings.busyMode}
                onChange={(e) => setSettings({ ...settings, busyMode: e.target.checked })}
              />
              <div className="h-6 w-11 rounded-full bg-slate-600 peer-checked:bg-primary-600 transition-colors">
                <div
                  className="h-5 w-5 translate-x-0.5 rounded-full bg-white transition peer-checked:translate-x-5"
                  aria-hidden
                />
              </div>
            </label>
          </div>
        </Card>

        <Card title="Working Hours">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start"
              type="time"
              value={settings.workingHours.start}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, start: e.target.value },
                })
              }
            />
            <Input
              label="End"
              type="time"
              value={settings.workingHours.end}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, end: e.target.value },
                })
              }
            />
          </div>
        </Card>

        <Card title="Notifications" className="lg:col-span-2">
          <div className="flex items-center space-x-6">
            {['telegram', 'email'].map((channel) => (
              <label key={channel} className="flex items-center space-x-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={settings.notifications.includes(channel as any)}
                  onChange={() => toggleNotification(channel)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary-500 focus:ring-primary-500"
                />
                <span className="capitalize">{channel}</span>
              </label>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
