import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';

const mockActiveCalls = [
  { callId: 'call_2', caller: 'Unknown', duration: '02:31', status: 'in_progress' },
  { callId: 'call_3', caller: 'Fatima Khalid', duration: '00:45', status: 'received' },
];

export default function LiveMonitorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Live Monitor</h2>
        <p className="text-sm text-slate-400">Observe active calls in real time</p>
      </div>
      <Card title="Active Calls">
        <Table
          columns={[
            { header: 'Call ID', accessor: 'callId' },
            { header: 'Caller', accessor: 'caller' },
            { header: 'Duration', accessor: 'duration' },
            {
              header: 'Status',
              render: (row) => (
                <Badge variant={row.status === 'in_progress' ? 'info' : 'muted'}>
                  {row.status}
                </Badge>
              ),
            },
          ]}
          data={mockActiveCalls}
        />
      </Card>
    </div>
  );
}
