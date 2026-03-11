import { register, login } from "../services/authService.js";

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
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

