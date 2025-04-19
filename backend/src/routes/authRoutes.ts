import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
const router = Router();
export default router;

import dotenv from "dotenv";
import passport from "../passport";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import { isAuth } from "../middlewares/authMiddleware";
dotenv.config();

// Register a new user
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating user" });
  }
});

// Local login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 3600000), // 1 hour
    });
    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error logging in" });
  }
});

router.post("/logout", isAuth, async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

router.get(
  "/login/federated/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google-redirect",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req: any, res) => {
    console.log("entered here");
    const user = req.user;
    console.log("🚀 ~ user:", user);
    // const token = jwt.sign(
    //   {
    //     id: user.id,
    //     displayName: user.displayName,
    //     email: user.emails[0].value,
    //   },
    //   process.env.JWT_SECRET!,
    //   { expiresIn: "1h" }
    // );

    // // Send token to frontend or redirect
    // res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
    // res.redirect("http://localhost:3000/oauth2/redirect/google");
    res.redirect("/");
  }
);

router.get("/login", function (req, res, next) {
  res.render("login");
});
