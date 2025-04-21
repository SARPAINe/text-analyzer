import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils";
import { User } from "../models";

const validateCredentials = (email: string, password: string) => {
  if (!email || !password) {
    throw new ApiError("Email and password are required", 400);
  }
};

const checkExistingUser = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    throw new ApiError("Email already in use", 400);
  }
};

const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

const comparePasswords = async (plain: string, hashed: string) => {
  return bcrypt.compare(plain, hashed);
};

export const generateToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
};

export const register = async (email: string, password: string) => {
  validateCredentials(email, password);
  await checkExistingUser(email);
  const hashedPassword = await hashPassword(password);
  return User.create({ email, password: hashedPassword });
};

export const login = async (email: string, password: string) => {
  validateCredentials(email, password);

  const user = await User.findOne({ where: { email } });
  if (!user || !(await comparePasswords(password, user.password!))) {
    throw new ApiError("Invalid email or password", 401);
  }

  const token = generateToken({ id: user.id, email: user.email });
  return { token };
};

export const authService = {
  register,
  login,
  generateToken,
};
