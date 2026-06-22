import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRE = process.env.JWT_EXPIRE as unknown as number;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE as unknown as number;
export const jwtService = {
  createAccessToken(userId: number) {
    const payload = {
      userId,
      jti: crypto.randomUUID(),
    };
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
  },

  createRefreshToken(userId: number) {
    const payload = {
      userId,
      jti: crypto.randomUUID(),
    };
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRE,
    });
  },

  decodedToken(token: string) {
    return jwt.decode(token);
  },

  verifyAccessToken(accessToken: string) {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET);
      return decoded;
    } catch {
      return false;
    }
  },
  verifyRefreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      return decoded;
    } catch {
      return false;
    }
  },
};
