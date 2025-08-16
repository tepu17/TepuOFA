export default async function handler(req, res) {
  try {
    const { entry } = req.query;

    if (!entry) {
      return res.status(400).json({ error: "Missing entry ID" });
    }

    const teamRes = await fetch(
      `https://fantasy.premierleague.com/api/entry/${entry}/event/1/picks/`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OpenFantasyAssistant/1.0)",
        },
      }
    );

    if (!teamRes.ok) {
      return res.status(teamRes.status).json({ error: "Failed to fetch FPL team" });
    }

    const teamData = await teamRes.json();

    // 👉 do your rating logic here
    return res.status(200).json({ success: true, teamData });

  } catch (err) {
    console.error("API /rate error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
