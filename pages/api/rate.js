async function fetchJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('Upstream error');
  return r.json();
}
export default async function handler(req, res) {
  const entry = req.query.entry;
  if (!entry) return res.status(400).json({ error: "Missing entry id" });
  try {
    const base = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const [bootstrap, picksData] = await Promise.all([
      fetchJson(`${base}://${host}/api/bootstrap`),
      fetchJson(`${base}://${host}/api/picks?id=${encodeURIComponent(entry)}`),
    ]);
    const byId = new Map(bootstrap.elements.map(p=>[p.id, p]));
    const teamIds = picksData.picks.map(p=>p.element);
    const squad = teamIds.map(id => byId.get(id)).filter(Boolean);
    const value = squad.reduce((s,p)=>s + p.now_cost/10, 0);
    const avgForm = squad.reduce((s,p)=> s + (parseFloat(p.form||'0')||0), 0) / Math.max(1, squad.length);
    const avgPPG = squad.reduce((s,p)=> s + (parseFloat(p.points_per_game||'0')||0), 0) / Math.max(1, squad.length);
    let score = 50 + (avgForm-3)*8 + (avgPPG-3)*6;
    score = Math.round(Math.max(0, Math.min(100, score)));
    const types = {1:'GKP',2:'DEF',3:'MID',4:'FWD'};
    const counts = {GKP:0,DEF:0,MID:0,FWD:0};
    for (const p of squad) counts[types[p.element_type]]++;
    const issues = [];
    if (counts.GKP < 2) issues.push("Add a backup goalkeeper");
    if (counts.DEF < 4) issues.push("Defence is light — consider at least 4 defenders");
    if (counts.MID < 4) issues.push("Midfield depth is low — add midfielders");
    if (counts.FWD < 2) issues.push("Forwards are light — add a second/third forward");
    if (value > 100.0) issues.push("Squad price exceeds £100.0m");
    const captain = squad.slice().sort((a,b)=> (parseFloat(b.form||'0')*0.6 + parseFloat(b.points_per_game||'0')*0.4) - (parseFloat(a.form||'0')*0.6 + parseFloat(a.points_per_game||'0')*0.4))[0];
    const notInTeam = bootstrap.elements.filter(p=>!teamIds.includes(p.id));
    const sugg = notInTeam.map(p=>{
      const form = parseFloat(p.form||'0');
      const ppg = parseFloat(p.points_per_game||'0');
      const val = p.total_points / Math.max(1, p.now_cost/10);
      const s = form*0.6 + ppg*0.3 + val*0.1;
      return {...p, s};
    }).sort((a,b)=>b.s-a.s).slice(0,20).map(p=>`Consider ${p.web_name} (${types[p.element_type]}) — form ${p.form}, PPG ${p.points_per_game}, £${(p.now_cost/10).toFixed(1)}m`);
    return res.status(200).json({
      rating: score,
      avgForm,
      avgPPG,
      value,
      captain: captain ? { web_name: captain.web_name, form: captain.form, ppg: captain.points_per_game, fdr: 3 } : null,
      issues,
      suggestions: sugg
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
