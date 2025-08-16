export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing entry id" });
  try {
    const r = await fetch(`https://fantasy.premierleague.com/api/entry/${id}/`);
    if (!r.ok) return res.status(r.status).json({ error: "Entry not found" });
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
