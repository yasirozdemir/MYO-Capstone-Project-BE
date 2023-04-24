import createHttpError from "http-errors";
import { RequestHandler, Request } from "express";
import { verifyAccessToken, TokenPayload } from "./tools";

export interface UserRequest extends Request {
  user?: TokenPayload;
}

export const JWTTokenAuth: RequestHandler = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(401, {
        message: "Please provide a Bearer token in authorization header!",
        error: "no token",
      })
    );
  } else {
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    try {
      const payload = await verifyAccessToken(accessToken);
      req.user = { _id: payload._id, email: payload.email };
      next();
    } catch (error) {
      next(
        createHttpError(401, {
          message: "Please provide a Bearer token in authorization header!",
          error: "expired",
        })
      );
    }
  }
};
