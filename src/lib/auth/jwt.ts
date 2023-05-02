import createHttpError from "http-errors";
import { RequestHandler, Request } from "express";
import { verifyAccessToken, TokenPayload } from "./tools";

export interface IUserRequest extends Request {
  user?: TokenPayload;
  isLiked?: boolean;
}

export const JWTTokenAuth: RequestHandler = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "No token!"));
  } else {
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    try {
      const payload = await verifyAccessToken(accessToken);
      req.user = {
        _id: payload._id,
        email: payload.email,
        verified: payload.verified,
      };
      next();
    } catch (error) {
      next(createHttpError(401, "Expired token!"));
    }
  }
};
