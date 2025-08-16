import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import PlayerRow from '../components/PlayerRow';

export default function Players() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [pos, setPos] = useState('ALL');

  useEffect(()=>{ fetch('/api/players').then(r=>r.json()).then(setData); },[]);

  const list = useMemo(()=>{
    if (!data) return [];
    return data.players.filter(p=>{
      const matchesQ = p.web_name.toLowerCase().includes(q.toLowerCase());
      const matchesPos = pos==='ALL' || p.element_type_name===pos;
      return matchesQ && matchesPos;
    }).slice().sort((a,b)=>b.sortScore-a.sortScore);
  },[data,q,pos]);

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex gap-2 flex-wrap items-center">
          <input className="input" placeholder="Search players…" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={pos} onChange={e=>setPos(e.target.value)}>
            {['ALL','GKP','DEF','MID','FWD'].map(x=>(<option key={x}>{x}</option>))}
          </select>
        </div>
      </Card>

      <Card title="Players (with next fixture & FDR)">
        {!data ? 'Loading…' : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Team</th><th>Pos</th><th>£</th><th>Form</th><th>PPG</th><th>Next</th><th>FDR</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0,300).map(p=>(
                <PlayerRow key={p.id} p={p} />
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
