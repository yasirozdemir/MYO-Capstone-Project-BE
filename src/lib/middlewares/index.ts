import { RequestHandler } from "express";
import { IUserRequest } from "../auth/jwt";
import createHttpError from "http-errors";
import WLsModel from "../../api/watchlists/model";
import { trigger404 } from "../../errorHandlers";

export const checkMember: RequestHandler = async (req, res, next) => {
  const userID = (req as IUserRequest).user!._id;
  const WL = await WLsModel.findById(req.params.WLID);
  if (WL) {
    if (WL.members.includes(userID)) {
      next();
    } else {
      next(createHttpError(401, "You are not a member of this watchlist!"));
    }
  } else {
    next(trigger404("Watchlist", req.params.WLID));
  }
};
