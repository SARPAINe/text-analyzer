import { Request, Response } from "express";
import { authService } from "../services";
import { ApiResponse } from "../utils";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.registerUser(email, password);
  res.status(201).json(new ApiResponse("User registered successfully", user));
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { token } = await authService.loginUser(email, password);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(Date.now() + 3600000),
  });

  res.json(new ApiResponse("Login successful", { token }));
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json(new ApiResponse("Logged out successfully", null));
};

export const googleAuthRedirect = (req: any, res: Response) => {
  const user = req.user;
  console.log("🚀 ~ user:", user);

  // const token = generateToken({ id: user.id, email: user.email });
  // res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  res.redirect("/");
};

export const renderLogin = (_req: Request, res: Response) => {
  res.render("login");
};
