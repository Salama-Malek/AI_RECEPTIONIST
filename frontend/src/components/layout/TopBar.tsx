import Button from '../ui/Button';
import { useBusyMode } from '../../hooks/useBusyMode';
import Badge from '../ui/Badge';

export default function TopBar() {
  const { busyMode, toggleBusyMode, loading } = useBusyMode();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-surface-foreground px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Salama AI Receptionist</h1>
        <p className="text-sm text-slate-400">Operational overview and call intelligence</p>
      </div>
      <div className="flex items-center space-x-4">
        <Badge variant={busyMode ? 'warning' : 'success'}>
          {busyMode ? 'Busy Mode' : 'Available'}
        </Badge>
        <Button
          size="sm"
          variant={busyMode ? 'secondary' : 'primary'}
          onClick={toggleBusyMode}
          disabled={loading}
        >
          {busyMode ? 'Disable Busy' : 'Enable Busy'}
        </Button>
        <div className="flex items-center space-x-3 rounded-full bg-slate-800/70 px-3 py-2">
          <div className="h-9 w-9 rounded-full bg-primary-600 text-center text-lg font-semibold leading-9 text-white">
            S
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Salama Ops</div>
            <div className="text-xs text-slate-400">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
