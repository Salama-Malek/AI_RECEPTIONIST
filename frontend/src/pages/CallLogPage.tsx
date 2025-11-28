import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { CallSummary } from '../types/call';
import { fetchCalls } from '../api/calls';

export default function CallLogPage() {
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [status, setStatus] = useState<'all' | 'open' | 'handled' | 'spam'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCalls();
        setCalls(data);
        setError(null);
      } catch (err) {
        setError('Failed to load calls');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns: Column<CallSummary>[] = [
    {
      header: 'Date',
      render: (row) => new Date(row.startedAt).toLocaleString(),
    },
    { header: 'Caller', render: (row) => row.callerName || row.fromNumber },
    { header: 'Number', accessor: 'fromNumber' },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)}>
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Urgency',
      render: (row) => (
        <Badge variant={urgencyVariant(row.urgency)}>{row.urgency}</Badge>
      ),
    },
    {
      header: 'Duration',
      render: (row) => (row.durationSeconds ? `${Math.round(row.durationSeconds / 60)} min` : '—'),
    },
  ];

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      if (urgency !== 'all' && call.urgency !== urgency) return false;
      if (status !== 'all' && call.status !== status) return false;
      const startOk = dateRange.start ? new Date(call.startedAt) >= new Date(dateRange.start) : true;
      const endOk = dateRange.end ? new Date(call.startedAt) <= new Date(dateRange.end) : true;
      return startOk && endOk;
    });
  }, [calls, dateRange, urgency]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Call Log</h2>
          <p className="text-sm text-slate-400">Monitor recent calls and outcomes</p>
        </div>
      </div>
      <Card title="Filters">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Input
            label="Start date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
          />
          <Input
            label="End date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
          />
          <Select
            label="Urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="handled">Handled</option>
            <option value="spam">Spam</option>
          </Select>
        </div>
      </Card>
      <Card>
        {loading && <div className="py-10 text-center text-slate-400">Loading calls…</div>}
        {error && !loading && (
          <div className="py-6 text-center text-red-300">Error loading calls: {error}</div>
        )}
        {!loading && !error && filteredCalls.length === 0 && (
          <div className="py-10 text-center text-slate-400">
            No calls yet. Calls will appear once Salama AI handles real calls.
          </div>
        )}
        {!loading && !error && filteredCalls.length > 0 && (
          <Table
            columns={columns}
            data={filteredCalls}
            onRowClick={(row) => navigate(`/calls/${row.id}`)}
            emptyMessage="No calls found for selected filters."
          />
        )}
      </Card>
    </div>
  );
}

function statusVariant(status: CallSummary['status']) {
  switch (status) {
    case 'handled':
      return 'success';
    case 'open':
      return 'info';
    case 'spam':
      return 'danger';
    default:
      return 'muted';
  }
}

function urgencyVariant(urgency: CallSummary['urgency']) {
  switch (urgency) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'info';
    default:
      return 'muted';
  }
}
