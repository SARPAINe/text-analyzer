import { Router } from "express";
import passport from "../passport";
import { isAuth } from "../middlewares/authMiddleware";
import {
  register,
  login,
  logout,
  googleAuthRedirect,
  renderLogin,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuth, logout);

// Google OAuth
router.get(
  "/login/federated/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google-redirect",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleAuthRedirect
);

// Optional: For a templated login page (if used)
router.get("/login", renderLogin);

export default router;
