import jwt from "jsonwebtoken";
import "dotenv/config";
import { Role } from "../../generated/prisma/enums";

export interface JwtPayload {
  userId: number;
  role: Role;
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as unknown as JwtPayload;
};