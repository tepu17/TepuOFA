import { useEffect, useState } from 'react';
import Card from '../components/Card';

export default function Home() {
  const [meta, setMeta] = useState(null);
  const [captain, setCaptain] = useState(null);

  useEffect(() => {
    fetch('/api/bootstrap').then(r=>r.json()).then(setMeta);
    fetch('/api/captain').then(r=>r.json()).then(setCaptain);
  },[]);

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card title="Players">{meta ? <div className="text-3xl font-bold">{meta.elements.length}</div> : "Loading…"}</Card>
        <Card title="Teams">{meta ? <div className="text-3xl font-bold">{meta.teams.length}</div> : "Loading…"}</Card>
        <Card title="Gameweeks">{meta ? <div className="text-3xl font-bold">{meta.events.length}</div> : "Loading…"}</Card>
      </div>

      <Card title="Captain Suggestions (next GW)">
        {!captain ? "Calculating…" : (
          <ul className="list-disc ml-5 space-y-1">
            {captain.top.slice(0,10).map((c,i)=>(
              <li key={c.id}>
                <span className="font-semibold">{i===0 ? "⭐ " : ""}{c.web_name}</span>
                {" — "}{c.team_short_name} {c.next_opponent ? (c.is_home ? "vs" : "@") : ""} {c.next_opponent || ""}
                {" · Form "}{c.form}{" · PPG "}{c.ppg}{" · FDR "}{c.fdr}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
