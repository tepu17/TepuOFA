export default async function handler(req, res) {
  try {
    const r = await fetch("https://fantasy.premierleague.com/api/fixtures/", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!r.ok) throw new Error("Failed to fetch fixtures data");
    const data = await r.json();

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
    return res.status(200).json(data);
  } catch (e) {
    console.error("Fixtures API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
