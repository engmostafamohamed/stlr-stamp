import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// @ts-ignore
import { Strategy as AppleStrategy } from "@nicokaiser/passport-apple";

// Google strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_REDIRECT_URI!,
  },
  async (accessToken, refreshToken, profile, done) => {
    done(null, { provider: "google", profile });
  }
));

// Apple strategy
passport.use(new AppleStrategy(
  {
    clientID: process.env.APPLE_CLIENT_ID!,
    teamID: process.env.APPLE_TEAM_ID!,
    keyID: process.env.APPLE_KEY_ID!,
    key: process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n"), // <-- change here
    callbackURL: process.env.APPLE_REDIRECT_URI!,
  },
  async (
    accessToken: string,
    _refreshToken: string,
    idToken: any,
    profile: any,
    done: Function
  ) => {
    done(null, { provider: "apple", profile });
  }
));

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done: (err: any, user?: any) => void) => {
  done(null, obj);
});
