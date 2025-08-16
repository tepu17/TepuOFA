export default async function handler(req, res) {
  try {
    const { entry } = req.query;

    if (!entry) {
      return res.status(400).json({ error: "Missing entry ID" });
    }

    console.log("Fetching team for entry:", entry);

    const teamRes = await fetch(
      `https://fantasy.premierleague.com/api/entry/${entry}/event/1/picks/`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OpenFantasyAssistant/1.0)",
        },
      }
    );

    console.log("FPL API status:", teamRes.status);

    if (!teamRes.ok) {
      const text = await teamRes.text();
      console.error("FPL API error response:", text);
      return res.status(teamRes.status).json({ error: "Failed to fetch FPL team" });
    }

    const teamData = await teamRes.json();

    console.log("Team data received:", JSON.stringify(teamData).slice(0, 200)); // first 200 chars

    return res.status(200).json({ success: true, teamData });

  } catch (err) {
    console.error("API /rate crashed:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
