import z from "zod";
import { userService } from "../services/user.service";

export const authRegisterSchema = z
  .object({
    name: z.string().trim().min(1, {
      message: "Name is required",
    }),
    email: z
      .string()
      .trim()
      .min(1, {
        message: "Email is required",
      })
      .pipe(
        z
          .email({
            message: "Email invalid",
          })
          .refine(async (email: string) => {
            const emailExist = await userService.findEmailExist(email);
            return !emailExist;
          }),
      ),
    password: z.string().trim().min(6, {
      message: "Password is required",
    }),
    confirmPassword: z.string().trim().min(6, {
      message: "Confirm password is required",
    }),
  })
  .superRefine(({ password, confirmPassword }, context) => {
    if (password !== confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Confirm password does not match",
        path: ["confirmPassword"],
      });
    }
  });

export const authResetPasswordSchema = z
  .object({
    otp: z.string().trim().min(1, {
      message: "Otp code is required",
    }),
    password: z.string().trim().min(6, {
      message: "Password is required",
    }),
    confirmPassword: z.string().trim().min(6, {
      message: "Confirm password is required",
    }),
  })
  .superRefine(({ password, confirmPassword }, context) => {
    if (password !== confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Confirm password does not match",
        path: ["confirmPassword"],
      });
    }
  });
