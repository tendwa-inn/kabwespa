const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "change-this-secret-before-real-use";

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

function requireAuth(role) {
  const allowed = Array.isArray(role) ? role : role ? [role] : null;
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    try {
      const decoded = jwt.verify(token, SECRET);
      if (allowed && !allowed.includes(decoded.role)) {
        return res.status(403).json({ error: "Not authorized" });
      }
      req.auth = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
  };
}

module.exports = { sign, requireAuth };
