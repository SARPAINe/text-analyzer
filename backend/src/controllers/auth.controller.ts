import { Request, Response } from "express";
import { authService } from "../services";
import { ApiResponse } from "../utils";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.register(email, password);
  return res
    .status(201)
    .json(new ApiResponse("User registered successfully", user));
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { token } = await authService.login(email, password);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(Date.now() + 3600000),
  });

  return res.json(new ApiResponse("Login successful", { token }));
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token");
  return res.status(200).json(new ApiResponse("Logged out successfully", null));
};

export const googleAuthRedirect = (req: any, res: Response) => {
  const user = req.user;
  const token = authService.generateToken({
    id: user.id,
    email: user.email,
  });
  return res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
};
