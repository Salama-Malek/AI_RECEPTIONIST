import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api/settings';
import { Settings } from '../types/settings';

export function useBusyMode() {
  const [busyMode, setBusyMode] = useState(false);
  const [baseSettings, setBaseSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const settings = await getSettings();
        setBaseSettings(settings);
        setBusyMode(settings.busyMode);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleBusyMode = async () => {
    if (!baseSettings) return;
    const next = !busyMode;
    setBusyMode(next);
    const updated = { ...baseSettings, busyMode: next };
    setBaseSettings(updated);
    await updateSettings(updated);
  };

  return { busyMode, toggleBusyMode, loading };
}
