import jwt from "jsonwebtoken";
import { env } from "../config/environment";
import { JWTPayload, AuthUser } from "../types";

export const jwtUtil = {
  generateToken(user: AuthUser): string {
    const payload: JWTPayload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      managerId: user.managerId,
      residentId: user.residentId,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  },

  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  },

  decodeToken(token: string): JWTPayload | null {
    return jwt.decode(token) as JWTPayload | null;
  },
};
