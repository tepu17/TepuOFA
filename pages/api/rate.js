// pages/api/rate.js

async function fetchJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`Failed to fetch ${url}`);
  return r.json();
}

export default async function handler(req, res) {
  try {
    // Fetch live FPL bootstrap data
    const bootstrap = await fetchJson("https://fantasy.premierleague.com/api/bootstrap-static/");
    const players = bootstrap.elements;
    const teams = bootstrap.teams;
    const positions = bootstrap.element_types;

    // Just an example "rating" — adjust scoring logic as you want
    const rated = players.map(p => {
      const form = parseFloat(p.form) || 0;
      const ppg = parseFloat(p.points_per_game) || 0;
      const score = form * 0.6 + ppg * 0.4;

      return {
        id: p.id,
        web_name: p.web_name,
        team: teams.find(t => t.id === p.team)?.short_name || "",
        position: positions.find(et => et.id === p.element_type)?.singular_name || "",
        cost: p.now_cost / 10,
        form: p.form,
        points_per_game: p.points_per_game,
        total_points: p.total_points,
        rating: score.toFixed(2)
      };
    }).sort((a, b) => b.rating - a.rating);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
    return res.status(200).json({ players: rated.slice(0, 30) });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
