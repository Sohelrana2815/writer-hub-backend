/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env.js";
import prisma from "../lib/prisma.js";
import { AuthProvider, Role, UserStatus } from "@prisma/client";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
// Login method For Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done: VerifyCallback) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          return done(null, false, { message: "User does not exist" });
        }

        const isPasswordMatch = await bcrypt.compare(
          password as string,
          user.password as string,
        );

        if (!isPasswordMatch) {
          return done(null, false, { message: "Password does not match" });
        }

        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) return done(null, false, { message: "No email found" });
        // 1. Find the user with the email and also send or include the authAccounts
        const existingUser = await prisma.user.findUnique({
          where: { email: email },
          include: { authAccounts: true },
        });

        if (existingUser) {
          // Blocked login access if user is Banned or Deleted
          if (existingUser.status === UserStatus.BANNED) {
            return done(null, false, { message: "Your account is banned." });
          } else if (
            existingUser.status === UserStatus.DELETED ||
            existingUser.isDeleted
          ) {
            return done(null, false, { message: "Your account is deleted." });
          }

          const hasGoogleLinked = existingUser.authAccounts.some(
            (acc) =>
              acc.provider === AuthProvider.GOOGLE &&
              acc.providerId === profile.id,
          );

          if (!hasGoogleLinked) {
            // If the user has not linked their Google account
            await prisma.authProviderAccount.create({
              data: {
                userId: existingUser.id,
                provider: AuthProvider.GOOGLE, //=> Google
                providerId: profile.id, // id = 123 exact same Google account কিনা check করা
              },
            });
          }

          // Update Profile information

          const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: profile.displayName,
              image: profile?.photos?.[0].value,
              isVerified: true,
            },
          });

          return done(null, updatedUser);
        }

        // 3. If user does not exist create a new user account
        const newUser = await prisma.user.create({
          data: {
            name: profile.displayName,
            email: email,
            image: profile?.photos?.[0].value,
            role: Role.READER,
            isVerified: true,
            authAccounts: {
              create: {
                provider: AuthProvider.GOOGLE,
                providerId: profile.id,
              },
            },
          },
        });
        return done(null, newUser);
      } catch (error) {
        console.error("GoogleStrategy error:", error);
        return done(error);
      }
    },
  ),
);

// frontend localhost:3000/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
        select: { id: true, email: true, role: true },
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  },
);

// /google → Google login page
//         ↓
// User login
//         ↓
// /google/callback
//         ↓
// GoogleStrategy (your code runs) when passport.ts codes runs
//         ↓
// done(null, user)
//         ↓
// AuthControllers.googleCallback
