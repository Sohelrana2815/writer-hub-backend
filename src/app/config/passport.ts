import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env.js";
import prisma from "../lib/prisma.js";
import { AuthProvider, Role, UserStatus } from "@prisma/client";

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
          } else if (existingUser.status === UserStatus.DELETED) {
            return done(null, false, { message: "Your account is deleted." });
          }

          const hasGoogleLinked = existingUser.authAccounts.some(
            (acc) => acc.provider === AuthProvider.GOOGLE,
          );

          if (!hasGoogleLinked) {
            // If the user has not linked their Google account
            await prisma.authProviderAccount.create({
              data: {
                userId: existingUser.id,
                provider: AuthProvider.GOOGLE,
                providerId: profile.id,
              },
            });
          }

          // Update Profile information

          const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: profile.displayName,
              image: profile?.photos?.[0].value,
            },
          });

   return done(null,updatedUser);

   

        }

        // 1. Check user and create if not exists
        const user = await prisma.user.upsert({
          where: { email: email },
          update: {
            name: profile?.displayName,
            image: profile?.photos?.[0].value,
          },
          create: {
            name: profile.displayName,
            email: email,
            image: profile?.photos?.[0].value,
            role: Role.READER, // Default role
            isVerified: true, // Google user auto verified
            authAccounts: {
              create: {
                provider: AuthProvider.GOOGLE,
                providerId: profile.id,
              },
            },
          },
        });
        return done(null, user);
      } catch (error) {
        console.log("Google GoogleStrategy error", error);
        return done(error);
      }
    },
  ),
);

// frontend localhost:3000/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access
