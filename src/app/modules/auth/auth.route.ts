import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import { AuthControllers } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";

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

export const AuthRoutes = router;

// Postman test

