import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

import dotenv from "dotenv";
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
    (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      return done(null, profile);
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
