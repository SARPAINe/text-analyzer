import { Router } from "express";
import passport from "../passport";
import { isAuth } from "../middlewares";
import { authController } from "../controllers";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", isAuth, authController.logout);

// Google OAuth
router.get(
  "/login/federated/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google-redirect",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  authController.googleAuthRedirect
);

export default router;
