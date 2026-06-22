import express from "express";
import { authController } from "../controllers/auth.controller";
import {
  authRegisterSchema,
  authResetPasswordSchema,
} from "../validators/auth.validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const route = express.Router();

route.post(
  "/register",
  validateMiddleware(authRegisterSchema),
  authController.register,
);

route.post("/login", authController.login);
route.post("/verify-otp/:id", authController.verifyOtp);
route.post("/refresh-token", authController.refreshToken);
route.post(
  "/resend-verification-email",
  authController.resendVerificationEmail,
);
route.post("/forgot-password", authController.forgotPassword);
route.post(
  "/reset-password/:id",
  validateMiddleware(authResetPasswordSchema),
  authController.resetPassword,
);
export default route;
