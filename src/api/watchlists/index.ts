import express from "express";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import WLsModel from "./model";
import UsersModel from "../users/model";
import UsersRouter from "../users";
import { checkIsLiked, checkIsMemberOfWL } from "../../lib/middlewares";
import { trigger404 } from "../../errorHandlers";
import createHttpError from "http-errors";
const q2m = require("query-to-mongo");

// I'll call Watchlist WL
const WLRouter = express.Router();

// Get all the Watchlists in the DB
WLRouter.get("/", JWTTokenAuth, async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const WLs = await WLsModel.find(query.criteria).populate(
      "members",
      "_id name surname avatar"
    );
    res.send(WLs);
  } catch (error) {
    next(error);
  }
});

// Create a Watchlist
WLRouter.post("/", JWTTokenAuth, async (req, res, next) => {
  try {
    const userID = (req as IUserRequest).user!;
    const newWL = new WLsModel({ ...req.body, members: [userID] });
    const { _id } = await newWL.save();
    await UsersModel.findByIdAndUpdate(userID, { $push: { watchlists: _id } });
    res.status(201).send({ watchlistID: _id });
  } catch (error) {
    next(error);
  }
});

// Get a Watchlist with it's ID
WLRouter.get("/:WLID", JWTTokenAuth, async (req, res, next) => {
  try {
    const WL = await WLsModel.findById(req.params.WLID);
    if (WL) res.send(WL);
    else next(trigger404("watchlist", req.params.WLID));
  } catch (error) {
    next(error);
  }
});

// Get all the Watchlists that the User is a member of
UsersRouter.get("/:userID/watchlists", JWTTokenAuth, async (req, res, next) => {
  try {
    const userID = req.params.userID;
    const WLs = await WLsModel.find({ members: { $in: [userID] } });
    res.send(WLs);
  } catch (error) {
    next(error);
  }
});

// Edit a Watchlist
WLRouter.put(
  "/:WLID",
  JWTTokenAuth,
  checkIsMemberOfWL,
  async (req, res, next) => {
    try {
      const editedWL = await WLsModel.findByIdAndUpdate(
        req.params.WLID,
        req.body,
        { new: true, runValidators: true }
      );
      res.send(editedWL);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a Watchlist
WLRouter.delete(
  "/:WLID",
  JWTTokenAuth,
  checkIsMemberOfWL,
  async (req, res, next) => {
    try {
      const deletedWL = await WLsModel.findByIdAndDelete(req.params.WLID);
      if (deletedWL) res.status(204).send();
      else trigger404("Watchlist", req.params.WLID);
    } catch (error) {
      next(error);
    }
  }
);

// Like a Watchlist
WLRouter.post(
  "/:WLID/likes",
  JWTTokenAuth,
  checkIsLiked,
  async (req, res, next) => {
    try {
      if (!(req as IUserRequest).isLiked) {
        const userID = (req as IUserRequest).user!._id;
        await WLsModel.findByIdAndUpdate(req.params.WLID, {
          $push: { likes: userID },
        });
        await UsersModel.findByIdAndUpdate(userID, {
          $push: { likedWatchlists: req.params.WLID },
        });
        res.send({ message: "Liked!" });
      } else {
        next(createHttpError(400, "You've already liked this watchlist!"));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default WLRouter;
