import express from "express";
import createHttpError from "http-errors";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import WatchlistsModel from "./model";

const WatchlistsRouter = express.Router();

WatchlistsRouter.post("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

export default WatchlistsRouter;
