export default async function handler(req, res) {
  try {
    const { entry } = req.query; // ?entry=4404608

    if (!entry) {
      return res.status(400).json({ ok: false, error: "Missing entry parameter" });
    }

    // For now, just echo the entry back (no external fetch yet)
    return res.status(200).json({
      ok: true,
      entry,
      message: `Received entry ${entry}`
    });

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Unknown error" });
  }
}
