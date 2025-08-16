// pages/api/players.js

async function fetchJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`Failed to fetch ${url}`);
  return r.json();
}

export default async function handler(req, res) {
  try {
    // Direct call to the official FPL bootstrap endpoint
    const bootstrap = await fetchJson("https://fantasy.premierleague.com/api/bootstrap-static/");

    // Map players to something usable
    const players = bootstrap.elements.map(p => ({
      id: p.id,
      web_name: p.web_name,
      team: bootstrap.teams.find(t => t.id === p.team)?.name || "",
      position: bootstrap.element_types.find(et => et.id === p.element_type)?.singular_name || "",
      now_cost: p.now_cost / 10, // prices come in tenths
      total_points: p.total_points,
      form: p.form,
      points_per_game: p.points_per_game,
      selected_by_percent: p.selected_by_percent
    }));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
    return res.status(200).json({ players });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
