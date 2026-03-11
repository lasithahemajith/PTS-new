export const requireRole = (...allowed) => {
    return (req, res, next) => {
      try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        if (!allowed.includes(req.user.role))
          return res.status(403).json({ error: "Forbidden" });
        next();
      } catch (e) {
        return res.status(500).json({ error: "Role check failed" });
      }
    };
  };
  