export default async function handler(req, res) {
  try {
    const r = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!r.ok) return res.status(r.status).json({ error: 'Upstream error' });
    const data = await r.json();
    const teams = Object.fromEntries(data.teams.map(t => [t.id, t]));
    const types = Object.fromEntries(data.element_types.map(t => [t.id, t]));
    const elements = data.elements.map(e => ({
      ...e,
      ppg: parseFloat(e.points_per_game || '0'),
      form: e.form,
      team_short_name: teams[e.team]?.short_name || '',
      element_type_name: types[e.element_type]?.singular_name_short || ''
    }));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    return res.status(200).json({ ...data, elements });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
