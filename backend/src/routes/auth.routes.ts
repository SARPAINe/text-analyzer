import { Router } from "express";
import passport from "../passport";
import { isAuth, validate } from "../middlewares";
import { authController } from "../controllers";
import Joi from "joi";

const router = Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().min(6).required().label("Password"),
});

router.post("/register", validate(loginSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", isAuth, authController.logout);

// Google OAuth
router.get(
  "/login/federated/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  })
);
router.get(
  "/google-redirect",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  authController.googleAuthRedirect
);

export default router;
