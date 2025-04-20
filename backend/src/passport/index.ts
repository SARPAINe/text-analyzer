import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

import dotenv from "dotenv";
import { User } from "../models";
import { where } from "sequelize";
dotenv.config({ path: ".env" });
const env = process.env.NODE_ENV;
if (env !== "production") {
  dotenv.config({ path: `.env.${env}` });
}
console.log("Registering GoogleStrategy...");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/v1/auth/google-redirect",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          where: { googleId: profile.id },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0].value as string,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

export default passport;
