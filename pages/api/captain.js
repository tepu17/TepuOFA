async function fetchJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`Fetch error: ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  try {
    // Fetch directly from FPL API
    const [bootstrap, fixtures] = await Promise.all([
      fetchJson("https://fantasy.premierleague.com/api/bootstrap-static/"),
      fetchJson("https://fantasy.premierleague.com/api/fixtures/"),
    ]);

    const teamById = Object.fromEntries(bootstrap.teams.map(t => [t.id, t]));
    const upcoming = fixtures.filter(f => !f.finished);
    const nextByTeam = new Map();

    for (const f of upcoming) {
      if (!nextByTeam.has(f.team_h)) nextByTeam.set(f.team_h, f);
      if (!nextByTeam.has(f.team_a)) nextByTeam.set(f.team_a, f);
    }

    function fdrFor(teamId, isHome) {
      const fixture = nextByTeam.get(teamId);
      if (!fixture) return { fdr: 3, opponent: null, is_home: isHome };
      const oppId = isHome ? fixture.team_a : fixture.team_h;
      const opp = teamById[oppId];
      const strength = opp?.strength ?? 85;
      const fdr = strength <= 70 ? 2 : strength <= 80 ? 3 : strength <= 90 ? 4 : 5;
      return { fdr, opponent: teamById[oppId]?.short_name || null, is_home: isHome };
    }

    const players = bootstrap.elements.map(p => {
      const info = fdrFor(p.team, true);
      const form = parseFloat(p.form || '0');
      const ppg = parseFloat(p.points_per_game || '0');
      const score = form * 0.6 + ppg * 0.3 + (6 - (info.fdr || 3)) * 0.4;
      return {
        id: p.id,
        web_name: p.web_name,
        team_short_name: teamById[p.team]?.short_name || "",
        form: p.form,
        ppg: p.points_per_game,
        fdr: info.fdr,
        next_opponent: info.opponent,
        is_home: info.is_home,
        score
      };
    }).sort((a, b) => b.score - a.score);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
    return res.status(200).json({ top: players.slice(0, 20) });
  } catch (e) {
    console.error("Captain API Error:", e);
    return res.status(500).json({ error: e.message });
  }
}
