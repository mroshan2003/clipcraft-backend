export function adminAuth(req, res, next) {
  const pass = req.headers["x-admin-key"];
  if (!pass) return res.status(401).json({ error: "No admin key provided" });

  if (pass !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Invalid admin key" });
  }

  next();
}
