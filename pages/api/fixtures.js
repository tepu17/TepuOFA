export default async function handler(req, res) {
  try {
    const r = await fetch('https://fantasy.premierleague.com/api/fixtures/');
    if (!r.ok) return res.status(r.status).json({ error: 'Upstream error' });
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
