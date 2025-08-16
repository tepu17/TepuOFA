import { useState } from 'react';
import Card from '../components/Card';
import TeamReview from '../components/TeamReview';

export default function MyTeam() {
  const [entryId, setEntryId] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setErr(''); setResult(null);
    try {
      const r = await fetch(`/api/rate?entry=${encodeURIComponent(entryId)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed');
      setResult(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Card title="Load & Rate Your FPL Team">
        <div className="flex gap-2 max-w-xl">
          <input className="input" placeholder="Enter your FPL Entry ID" value={entryId} onChange={e=>setEntryId(e.target.value)} />
          <button className="btn" onClick={run} disabled={!entryId || loading}>{loading ? "Loading…" : "Rate"}</button>
        </div>
        {err && <p className="text-red-400 mt-3">{err}</p>}
      </Card>

      <TeamReview result={result} />
    </div>
  );
}
