// pages/api/rate.js

async function fetchJson(url) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`Failed to fetch: ${url} (${r.status})`);
  return r.json();
}

export default async function handler(req, res) {
  const entryId = (req.query.entry || "").toString().trim();

  // Validate entry id
  if (!/^\d+$/.test(entryId)) {
    return res.status(400).json({ ok: false, error: "Missing or invalid ?entry=<id>" });
  }

  try {
    // 1) Get bootstrap (teams, players, events)
    const bootstrap = await fetchJson("https://fantasy.premierleague.com/api/bootstrap-static/");
    const events = bootstrap.events || [];
    const current = events.find(e => e.is_current) || events.find(e => e.is_next);
    const gw = current?.id;
    if (!gw) {
      return res.status(200).json({
        ok: false,
        error: "Could not determine current/next gameweek",
        entry: entryId,
        event: null,
        picks: [],
        rating: 0
      });
    }

    // 2) Picks for this entry & GW
    const picksData = await fetchJson(
      `https://fantasy.premierleague.com/api/entry/${entryId}/event/${gw}/picks/`
    );

    // 3) Build lookups
    const elementsById = Object.fromEntries(bootstrap.elements.map(p => [p.id, p]));
    const teamsById = Object.fromEntries(bootstrap.teams.map(t => [t.id, t]));

    // 4) Map picks + quick per-player score
    const picks = (picksData.picks || []).map(pk => {
      const el = elementsById[pk.element] || {};
      const team = teamsById[el.team] || {};
      const form = parseFloat(el.form || "0");
      const ppg = parseFloat(el.points_per_game || "0");
      const score = form * 0.6 + ppg * 0.4; // tweak as you like

      return {
        element: pk.element,
        position: pk.position,
        is_captain: pk.is_captain,
        is_vice_captain: pk.is_vice_captain,
        multiplier: pk.multiplier,
        web_name: el.web_name || "",
        team_short: team.short_name || "",
        cost: el.now_cost ? el.now_cost / 10 : null,
        form: el.form || "0.0",
        points_per_game: el.points_per_game || "0.0",
        score
      };
    });

    // 5) Team rating (starters only, weighted by multiplier) → 0–100
    const starters = picks.filter(p => p.position <= 11);
    let raw = 0, wsum = 0;
    for (const p of starters) {
      const w = p.multiplier || 1;
      raw += p.score * w;
      wsum += w;
    }
    const rating = wsum ? Math.round((raw / (wsum * 10)) * 100) : 0;

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
    return res.status(200).json({
      ok: true,
      entry: entryId,
      event: gw,
      active_chip: picksData.active_chip || null,
      rating,
      picks
    });
  } catch (e) {
    // If team is private or GW not available yet, FPL may return 403/404.
    return res.status(200).json({
      ok: false,
      error: e.message,
      entry: entryId,
      event: null,
      picks: [],
      rating: 0
    });
  }
}
