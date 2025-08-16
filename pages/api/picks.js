export default async function handler(req, res) {
  const { id, event } = req.query;
  if (!id) return res.status(400).json({ error: "Missing entry id" });
  try {
    const entryRes = await fetch(`https://fantasy.premierleague.com/api/entry/${id}/`);
    if (!entryRes.ok) return res.status(entryRes.status).json({ error: "Entry not found" });
    const entry = await entryRes.json();
    const gw = event ? Number(event) : (entry.current_event || entry.started_event || 1);
    const picksRes = await fetch(`https://fantasy.premierleague.com/api/entry/${id}/event/${gw}/picks/`);
    if (!picksRes.ok) return res.status(picksRes.status).json({ error: "Picks not found" });
    const picks = await picksRes.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    return res.status(200).json({ ...picks, event: gw });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
