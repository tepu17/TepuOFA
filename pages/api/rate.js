export default function handler(req, res) {
  res.status(200).json({ ok: true, entry: req.query.entry || null });
}
