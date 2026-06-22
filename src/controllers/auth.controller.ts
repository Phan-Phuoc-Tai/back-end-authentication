import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { successResponse } from "../utils/response";

export const authController = {
  register: async (request: Request, response: Response) => {
    const user = await authService.register(request.body);
    successResponse(response, `Register success`, user, 201);
  },
  login: async (request: Request, response: Response) => {
    const { email, password } = request.body;
    if (!email || !password) {
      throw new Error("Email or password is incorrect");
    }
    const user = await authService.login(email, password);
    successResponse(response, `Login success`, user, 200);
  },
  verifyOtp: async (request: Request, response: Response) => {
    const { id: userId } = request.params;
    const { otp } = request.body;
    if (!otp) {
      throw new Error("OTP is required");
    }
    const user = await authService.verifyOtp(+userId!, otp as string);
    successResponse(response, `OTP verified success`, user, 200);
  },
  refreshToken: async (request: Request, response: Response) => {
    const { refreshToken } = request.body;
    const token = await authService.refreshToken(refreshToken);
    successResponse(response, `Refresh token success`, token, 200);
  },
  resendVerificationEmail: async (request: Request, response: Response) => {
    const { email } = request.body;
    await authService.resendVerificationEmail(email);
    successResponse(response, `Verification email send success`, null, 200);
  },
  forgotPassword: async (request: Request, response: Response) => {
    const { email } = request.body;
    await authService.forgotPassword(email);
    successResponse(response, `Password reset email send success`, null, 200);
  },
  resetPassword: async (request: Request, response: Response) => {
    const { id } = request.params;
    const { otp, password } = request.body;
    await authService.resetPassword(+id!, otp, password);
    successResponse(response, `Password reset success`, null, 200);
  },
};
