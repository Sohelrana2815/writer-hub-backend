import { NextFunction, Request, Response, Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import { AuthControllers } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";
import passport from "passport";

const router = Router();

router.post(
  "/signup",
  validateRequest(AuthValidation.signupZodSchema),
  AuthControllers.signup,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginZodSchema),
  AuthControllers.login,
);

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirectTo = (req.query.redirect as string) || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      accessType: "offline",
      state: redirectTo,
    })(req, res, next);
  },
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  AuthControllers.googleCallback,
);

export const AuthRoutes = router;

// Postman test
