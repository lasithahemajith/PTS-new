import { register, login } from "../services/authService.js";
import { createAuditLog } from "../utils/auditLogger.js";

export const registerUser = async (req, res) => {
  try {
    const user = await register(req.body);
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { token, user } = await login(req.body);

    createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "LOGIN",
      resource: "auth",
      details: `${user.name} logged in`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
    });

    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

