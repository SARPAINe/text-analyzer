import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils";
import { User } from "../models";

export const registerUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new ApiError("Email and password are required", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ email, password: hashedPassword });
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new ApiError("Email and password are required", 400);
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    throw new ApiError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  return { token };
};
