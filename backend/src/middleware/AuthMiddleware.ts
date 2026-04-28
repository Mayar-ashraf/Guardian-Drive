import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { sendUnauthorized, sendForbidden } from "../utils/HttpResponses";
import { Role } from "../../generated/prisma/enums"

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;    // JWTpayload is the type that will be later stored in the attribute which is userId and role (the cracked token)
      // user = {user.id , user.Role}
    }
  }
  /* 
  after this html request will have{
    body:
    header:
    params:

    user:  <---- so after this req.user.id and req.user.role decoded from the token can be accessed
  }
  */
}


export const authorize = (...roles: Role[]) => {  // role array is for all the roles that are authorized
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }
    if (!roles.includes(req.user.role)) { // check the user role with all the roles that are authorized and see if he is included
      sendForbidden(res);
      return;
    }
    next();
  };
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendUnauthorized(res);
    return;
  }

  const token = authHeader.split(" ")[1]; // to get the JWT token itself

  try {
    req.user = verifyAccessToken(token); // i am storing the decoded token here instead of cracking it everytime i want token or user id
    next();
  } catch {
    sendUnauthorized(res, "Invalid or expired token");
  }
};