import { useEffect, useState, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Call } from '../types/call';
import { getCallById, updateCallStatus } from '../api/calls';

export default function CallDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState<Call | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await getCallById(id);
      setCall(data);
    })();
  }, [id]);

  const updateStatus = async (status: Call['status']) => {
    if (!id) return;
    setUpdating(true);
    const updated = await updateCallStatus(id, status);
    setCall(updated);
    setUpdating(false);
  };

  if (!call) {
    return <div className="text-slate-300">Loading call...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Call Details</h2>
          <p className="text-sm text-slate-400">{call.callerName || call.fromNumber}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => navigate('/calls')}>
            Back to list
          </Button>
          <Button variant="primary" onClick={() => updateStatus('completed')} disabled={updating}>
            Mark as handled
          </Button>
          <Button variant="danger" onClick={() => updateStatus('spam')} disabled={updating}>
            Mark as spam
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Metadata" className="md:col-span-2">
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
            <Metadata label="Caller" value={call.callerName || 'Unknown'} />
            <Metadata label="Number" value={call.fromNumber} />
            <Metadata label="Dialed" value={call.toNumber} />
            <Metadata
              label="Status"
              value={<Badge variant="info">{call.status}</Badge>}
            />
            <Metadata
              label="Urgency"
              value={
                <Badge variant={call.urgency === 'high' ? 'danger' : call.urgency === 'normal' ? 'info' : 'muted'}>
                  {call.urgency}
                </Badge>
              }
            />
            <Metadata label="Start" value={new Date(call.startedAt).toLocaleString()} />
            {call.endedAt && (
              <Metadata label="End" value={new Date(call.endedAt).toLocaleString()} />
            )}
          </div>
        </Card>
        <Card title="AI Summary">
          <p className="text-sm text-slate-200">{call.summary}</p>
        </Card>
      </div>

      <Card title="Transcript">
        <div className="space-y-3">
          {call.transcript.map((line) => (
            <div key={line.id} className="flex items-start space-x-3">
              <Badge variant={line.role === 'caller' ? 'warning' : 'info'}>
                {line.role}
              </Badge>
              <div>
                <div className="text-xs text-slate-500">
                  {new Date(line.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-sm text-slate-100">{line.text}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metadata({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}
