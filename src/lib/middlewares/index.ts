import { RequestHandler } from "express";
import { IUserRequest } from "../auth/jwt";
import createHttpError from "http-errors";
import WLsModel from "../../api/watchlists/model";
import { trigger404 } from "../../errorHandlers";
import UsersModel from "../../api/users/model";
import { IUser } from "../../interfaces/IUser";

export const checkIsMemberOfWL: RequestHandler = async (req, res, next) => {
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

export const checkIsLiked: RequestHandler = async (req, res, next) => {
  const userID = (req as IUserRequest).user!._id;
  const WL = await WLsModel.findById(req.params.WLID);
  if (WL) {
    const user = (await UsersModel.findById(userID)) as IUser;
    const isLiked =
      WL.likes.some((id) => id.toString() === userID) &&
      user.likedWatchlists.some((id) => id.toString() === req.params.WLID);
    (req as IUserRequest).isLiked = isLiked;
    next();
  } else {
    next(trigger404("Watchlist", req.params.WLID));
  }
};
