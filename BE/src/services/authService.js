import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken } from "../utils/jwt.js";

export const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = generateToken({ id: user.id, role: user.role });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };

  return { token, user: safeUser };
};
