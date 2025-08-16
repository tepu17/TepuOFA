async function fetchJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('Upstream error');
  return r.json();
}
export default async function handler(req, res) {
  try {
    const base = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const [bootstrap, fixtures] = await Promise.all([
      fetchJson(`${base}://${host}/api/bootstrap`),
      fetchJson(`${base}://${host}/api/fixtures`),
    ]);

    const teamById = Object.fromEntries(bootstrap.teams.map(t=>[t.id, t]));
    const nextFixtureByTeam = new Map();
    const upcoming = fixtures.filter(f => !f.finished).sort((a,b)=>a.kickoff_time - b.kickoff_time);
    for (const f of upcoming) {
      if (!nextFixtureByTeam.has(f.team_h)) nextFixtureByTeam.set(f.team_h, f);
      if (!nextFixtureByTeam.has(f.team_a)) nextFixtureByTeam.set(f.team_a, f);
    }

    function fdrFor(teamId, isHome) {
      const fixture = nextFixtureByTeam.get(teamId);
      if (!fixture) return null;
      const oppId = isHome ? fixture.team_a : fixture.team_h;
      const opp = teamById[oppId];
      const strength = opp?.strength ?? 85;
      const fdr = strength <= 70 ? 2 : strength <= 80 ? 3 : strength <= 90 ? 4 : 5;
      return { fdr, opponent: teamById[oppId]?.short_name || null, is_home: isHome };
    }

    const players = bootstrap.elements.map(p => {
      const isHomeGuess = true;
      const info = fdrFor(p.team, isHomeGuess);
      const sortScore = (parseFloat(p.form||'0')||0)*0.65 + (parseFloat(p.points_per_game||'0')||0)*0.35 + (info ? (6 - info.fdr)*0.2 : 0);
      return {
        ...p,
        next_opponent: info?.opponent || null,
        is_home: info?.is_home || false,
        fdr: info?.fdr || null,
        sortScore
      };
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    return res.status(200).json({ players });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
