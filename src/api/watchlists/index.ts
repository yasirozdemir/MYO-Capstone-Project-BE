import express, { NextFunction } from "express";
import createHttpError from "http-errors";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import WatchlistsModel from "./model";
const WLsModel = WatchlistsModel;
import UsersModel from "../users/model";
import UsersRouter from "../users";
import { IWatchlist } from "../../interfaces/IWatchlist";
import { IUser } from "../../interfaces/IUser";
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

// // Edit a Watchlist
// WLRouter.put("/", JWTTokenAuth, async (req, res, next) => {
//   try {
//   } catch (error) {
//     next(error);
//   }
// });

export default WLRouter;
