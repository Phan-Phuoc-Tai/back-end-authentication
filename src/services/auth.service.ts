import { JwtPayload } from "jsonwebtoken";
import { UserData } from "../types/user.type";
import { generateOtp } from "../utils/generateOtp";
import { hashPassword, verifyPassword } from "../utils/hashing";
import { sendMailTemplate } from "../utils/mail";
import { redisClient } from "../utils/redis";
import { jwtService } from "./jwt.service";
import { userService } from "./user.service";

const authService = {
  async register({ name, email, password }: UserData) {
    //Hash password
    const passwordHash = hashPassword(password);
    //Create user in database
    const user = await userService.create({
      email,
      name,
      password: passwordHash,
    });
    //Generate otp (length = 6)
    const otp = generateOtp();
    //Save otp on redis
    await this.saveOtpOnRedis("verify", user.id, 600, otp);
    //SendMail
    await sendMailTemplate(user.email, "[F8 Student] Welcome", "otp-notice", {
      name: user.name,
      otp: otp,
    });
    //Return
    const { password: _, ...newUser } = user;
    return {
      newUser,
    };
  },
  saveOtpOnRedis(
    key: "verify" | "reset",
    userId: number,
    seconds: number,
    value: string,
  ) {
    return redisClient.setEx(`${key}:${userId}`, seconds, value);
  },
  async login(email: string, password: string) {
    //Find email -> user
    const user = await userService.findEmail(email);
    if (!user) {
      throw new Error("Email or password is incorrect");
    }

    //Lấy password hash -> user.password
    const passwordHash = user.password;

    //Verify password
    if (!verifyPassword(password, passwordHash)) {
      throw new Error("Email or password is incorrect");
    }

    //Check verified
    if (!user.isVerified) {
      throw new Error("Please check your email to verify account");
    }

    //Tạo token
    const accessToken = jwtService.createAccessToken(user.id);
    const refreshToken = jwtService.createRefreshToken(user.id);
    //Lưu redis
    await this.saveTokenOnRedis(
      "refreshToken",
      user.id,
      accessToken,
      refreshToken,
    );
    //Return
    const { password: _, ...safeUser } = user;
    return {
      ...safeUser,
      accessToken,
      refreshToken,
    };
  },
  saveTokenOnRedis(
    key: "refreshToken",
    userId: number,
    accessToken: string,
    refreshToken: string,
  ) {
    //key: refreshToken:{userId}:{refreshJti}
    //value: {"access":"accessJti","refresh":"refreshJti","userId":userIDvalue}
    const decodeAccess = jwtService.decodedToken(accessToken) as JwtPayload;
    const decodeRefresh = jwtService.decodedToken(refreshToken) as JwtPayload;
    //Thời gian sống của refreshToken
    const ttlRefresh = Math.ceil(decodeRefresh.exp! - Date.now() / 1000);
    return redisClient.setEx(
      `${key}:${userId}:${decodeRefresh.jti}`,
      ttlRefresh,
      JSON.stringify({
        access: decodeAccess.jti,
        refresh: decodeRefresh.jti,
        userId,
      }),
    );
  },

  async verifyOtp(userId: number, otp: string) {
    //Find user
    const user = await userService.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    //Get otp redis
    const otpRedis = await redisClient.get(`verify:${userId}`);
    if (!otpRedis) {
      throw new Error("OTP code expired!");
    }
    //Check and then update status isVerified
    if (otp !== otpRedis) {
      throw new Error("OTP code invalid!");
    }
    await userService.updateUserVerified(userId, true);
    user.isVerified = true;
    await redisClient.del(`verify:${userId}`);
    const { password: _, ...safeUser } = user;
    return {
      safeUser,
    };
  },
  async refreshToken(token: string) {
    //verifyToken
    const decoded = jwtService.verifyRefreshToken(token) as JwtPayload;
    if (!decoded) {
      throw new Error("Token invalid");
    }
    //check token on redis
    const refreshRedis = await redisClient.get(
      `refreshToken:${decoded.userId}:${decoded.jti}`,
    );
    if (!refreshRedis) {
      throw new Error("Unauthorized. Redirecting to login page");
    }

    //generate new Access , Refresh Token
    const newAccessToken = jwtService.createAccessToken(decoded.userId);
    const newRefreshToken = jwtService.createRefreshToken(decoded.userId);
    //Delete old refresh on redis
    await redisClient.del(`refreshToken:${decoded.userId}:${decoded.jti}`);
    //Save new refresh on redis
    await this.saveTokenOnRedis(
      "refreshToken",
      decoded.userId,
      newAccessToken,
      newRefreshToken,
    );
    //Return
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },
  async resendVerificationEmail(email: string) {
    //check email exit and isVerified = false
    const userExistWithoutVerify = await userService.findEmailVerify(
      email,
      false,
    );
    if (!userExistWithoutVerify) {
      throw new Error("Email is incorrect or verified");
    }

    //check verify on redis
    const otpRedis = await redisClient.get(
      `verify:${userExistWithoutVerify.id}`,
    );
    if (otpRedis) {
      await redisClient.del(`verify:${userExistWithoutVerify.id}`);
    }
    //generate OTP and then save on redis
    const newOtp = generateOtp(6);
    this.saveOtpOnRedis("verify", userExistWithoutVerify.id, 600, newOtp);

    //limit 3 submission in 60s
    const count = await redisClient.incr(`resend:${userExistWithoutVerify.id}`);
    if (count === 1) {
      await redisClient.expire(`resend:${userExistWithoutVerify.id}`, 60);
    }
    const ttlOTP = await redisClient.ttl(`resend:${userExistWithoutVerify.id}`);
    if (count > 3 && ttlOTP) {
      throw new Error(
        `You asked for the code to be sent too quickly. The system temporarily limits submissions, please come back in 1 minute`,
      );
    }
    //sendMail
    await sendMailTemplate(
      email,
      "[F8 Student] Resend OTP verification",
      "otp-notice",
      {
        name: userExistWithoutVerify.name,
        otp: newOtp,
      },
    );
    return true;
  },
  async forgotPassword(email: string) {
    //check user exist
    const user = await userService.findEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    //generate otp
    const otp = generateOtp(6);
    //save on redis with ttl 10ph : reset:${userId}
    await this.saveOtpOnRedis("reset", user.id, 600, otp);

    //limit 3 submission in 60s
    const count = await redisClient.incr(`reset:${user.id}:count`);
    if (count === 1) {
      await redisClient.expire(`reset:${user.id}:count`, 60);
    }
    const ttlOTP = await redisClient.ttl(`reset:${user.id}:count`);
    if (count > 3 && ttlOTP) {
      throw new Error(
        `You asked for the code to be sent too quickly. The system temporarily limits submissions, please come back in 1 minute`,
      );
    }
    //sendMail
    await sendMailTemplate(
      email,
      "[F8 Student] Reset password OTP verification",
      "otp-notice",
      {
        name: user.name,
        otp: otp,
      },
    );
    return true;
  },
  async resetPassword(userId: number, otp: string, password: string) {
    //check otp on redis
    const otpRedis = await redisClient.get(`reset:${userId}`);
    if (otpRedis !== otp) {
      throw new Error("OTP code is incorrect or expired");
    }
    //hash password
    const passwordHash: string = hashPassword(password);
    //update database
    await userService.updateUserPassword(userId, passwordHash);
    //del reset:{userId}
    await redisClient.del(`reset:${userId}`);
    //del refreshToken:{userId}
    const refreshTokens: string[] = await redisClient.keys(
      `refreshToken:${userId}:*`,
    );
    refreshTokens.map(async (key) => {
      await redisClient.del(key);
    });
    return true;
  },
};

export { authService };
