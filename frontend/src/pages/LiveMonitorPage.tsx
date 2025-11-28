import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';

type ActiveCall = {
  id: string;
  callerName?: string;
  fromNumber: string;
  connectedAt: number;
  durationSeconds: number;
  status: 'active';
};

export default function LiveMonitorPage() {
  const navigate = useNavigate();
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);

  useEffect(() => {
    // Mock polling for active calls; replace with GET /calls/active or WebSocket subscription later.
    const seed: ActiveCall[] = [
      {
        id: 'call_live_1',
        callerName: 'Unknown',
        fromNumber: '+12065550111',
        connectedAt: Date.now() - 90_000,
        durationSeconds: 90,
        status: 'active',
      },
      {
        id: 'call_live_2',
        callerName: 'Fatima Khalid',
        fromNumber: '+971501234567',
        connectedAt: Date.now() - 30_000,
        durationSeconds: 30,
        status: 'active',
      },
    ];
    setActiveCalls(seed);

    const interval = setInterval(() => {
      setActiveCalls((prev) =>
        prev.map((c) => ({
          ...c,
          durationSeconds: Math.floor((Date.now() - c.connectedAt) / 1000),
        })),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const columns = useMemo(
    () => [
      { header: 'Call ID', accessor: 'id' },
      { header: 'Caller', render: (row: ActiveCall) => row.callerName || row.fromNumber },
      {
        header: 'Duration',
        render: (row: ActiveCall) => formatDuration(row.durationSeconds),
      },
      {
        header: 'Status',
        render: () => <Badge variant="info">LIVE</Badge>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Live Monitor</h2>
          <p className="text-sm text-slate-400">Observe active calls in real time</p>
        </div>
        <Badge variant="info">Active: {activeCalls.length}</Badge>
      </div>
      <Card title="Active Calls">
        <Table
          columns={columns}
          data={activeCalls}
          onRowClick={(row: any) => navigate(`/calls/${row.id}`)}
          emptyMessage="No active calls right now."
        />
      </Card>
    </div>
  );
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}
