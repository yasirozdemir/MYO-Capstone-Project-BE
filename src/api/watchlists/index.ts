import express from "express";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import WLsModel from "./model";
import UsersModel from "../users/model";
import UsersRouter from "../users";
import {
  IFollowChecks,
  checkFollows,
  checkIsLiked,
  checkIsMemberOfWL,
} from "../../lib/middlewares";
import createHttpError from "http-errors";
import { coverUploader } from "../../lib/cloudinary";
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
    else
      next(
        createHttpError(
          404,
          `Watchlist with the ID of ${req.params.WLID} not found!`
        )
      );
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
      else
        next(
          createHttpError(
            404,
            `Watchlist with the ID of ${req.params.WLID} not found!`
          )
        );
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

// Dislike a Watchlist
WLRouter.delete(
  "/:WLID/likes",
  JWTTokenAuth,
  checkIsLiked,
  async (req, res, next) => {
    try {
      if ((req as IUserRequest).isLiked) {
        const userID = (req as IUserRequest).user!._id;
        await WLsModel.findByIdAndUpdate(req.params.WLID, {
          $pull: { likes: userID },
        });
        await UsersModel.findByIdAndUpdate(userID, {
          $pull: { likedWatchlists: req.params.WLID },
        });
        res.send({ message: "Disliked!" });
      } else {
        next(createHttpError(400, "You've already disliked this watchlist!"));
      }
    } catch (error) {
      next(error);
    }
  }
);

// Upload a cover for a Watchlist
WLRouter.post(
  "/:WLID/cover",
  JWTTokenAuth,
  checkIsMemberOfWL,
  coverUploader,
  async (req, res, next) => {
    try {
      if (req.file) {
        const WL = await WLsModel.findById(req.params.WLID);
        if (WL) {
          WL.cover = req.file.path;
          await WL.save();
          res.send({ cover: req.file.path });
        } else {
          next(
            createHttpError(
              404,
              `Watchlist with the ID of ${req.params.WLID} not found!`
            )
          );
        }
      } else {
        next(createHttpError(400, "Please provide an image file!"));
      }
    } catch (error) {
      next(error);
    }
  }
);

// Remove the cover of a Watchlist
WLRouter.delete(
  "/:WLID/cover",
  JWTTokenAuth,
  checkIsMemberOfWL,
  async (req, res, next) => {
    try {
      const WL = await WLsModel.findById(req.params.WLID);
      if (WL) {
        WL.cover =
          "https://res.cloudinary.com/yasirdev/image/upload/v1682762502/WhataMovie/watchlists/covers/watchlist_default.png";
        await WL.save();
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Watchlist with the ID of ${req.params.WLID} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// Add a new member to the Watchlist (only if they are following the user)
WLRouter.post(
  "/:WLID/members/:userID",
  JWTTokenAuth,
  checkIsMemberOfWL,
  checkFollows,
  async (req, res, next) => {
    try {
      if ((req as IFollowChecks).TheyAreFollowingMe) {
        const WL = await WLsModel.findById(req.params.WLID);
        if (WL) {
          const user2 = (req as IFollowChecks).user2;
          if (!WL.members.includes(req.params.userID)) {
            WL.members = [...WL.members, req.params.userID];
            await WL.save();
            user2.watchlists = [...user2.watchlists, req.params.WLID];
            await user2.save();
            res.send(WL.members);
          } else {
            next(
              createHttpError(
                400,
                "This user is already a member of this watchlist!"
              )
            );
          }
        } else {
          next(
            createHttpError(
              404,
              `Watchlist with the ID of ${req.params.WLID} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            400,
            "The user is not following you, you can't add them as a member!"
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default WLRouter;
