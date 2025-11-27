import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { Call, CallUrgency } from '../types/call';
import { getCalls } from '../api/calls';

export default function CallLogPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [urgency, setUrgency] = useState<'all' | CallUrgency>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getCalls();
      setCalls(data);
      setLoading(false);
    })();
  }, []);

  const columns: Column<Call>[] = [
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
        <Badge variant={row.urgency === 'high' ? 'danger' : row.urgency === 'normal' ? 'info' : 'muted'}>
          {row.urgency}
        </Badge>
      ),
    },
    { header: 'Summary', accessor: 'summary' },
  ];

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      if (urgency !== 'all' && call.urgency !== urgency) return false;
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </Select>
        </div>
      </Card>
      <Card>
        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading calls…</div>
        ) : (
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

function statusVariant(status: Call['status']) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'failed':
    case 'spam':
      return 'danger';
    default:
      return 'muted';
  }
}
