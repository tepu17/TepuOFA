export default function handler(req, res) {
  const { entry } = req.query; // get entry from URL query param (?entry=4404608)

  if (!entry) {
    return res.status(400).json({ ok: false, error: "Missing entry parameter" });
  }

  // Example response — you can customize logic later
  res.status(200).json({
    ok: true,
    entry,
    message: `Received entry ${entry}`
  });
}
