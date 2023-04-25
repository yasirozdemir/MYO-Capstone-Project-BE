import express from "express";
import PlaylistsModel from "./model";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import UsersRouter from "../users";
import createHttpError from "http-errors";
import { IPlaylist } from "../../interfaces/IPlayist";

const PlaylistsRouter = express.Router();

// Get all the playlists in database
PlaylistsRouter.get("/", JWTTokenAuth, async (req, res, next) => {
  try {
    const playlists = await PlaylistsModel.find().populate(
      "user",
      "_id fullName avatar"
    );
    res.send(playlists);
  } catch (error) {
    next(error);
  }
});

// Create a playlist
PlaylistsRouter.post("/me", JWTTokenAuth, async (req, res, next) => {
  try {
    const newPlaylist = new PlaylistsModel({
      ...req.body,
      user: (req as IUserRequest).user!._id,
    });
    const { _id } = await newPlaylist.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// Get a Playlist
PlaylistsRouter.get("/:playlistID", JWTTokenAuth, async (req, res, next) => {
  try {
    const playlist = await PlaylistsModel.findById(req.params.playlistID);
    res.send(playlist);
  } catch (error) {
    next(error);
  }
});

// Edit a Playlist
PlaylistsRouter.put("/:playlistID", JWTTokenAuth, async (req, res, next) => {
  try {
    const playlist = (await PlaylistsModel.findById(
      req.params.playlistID
    )) as IPlaylist;
    if (playlist) {
      if (playlist.user.toString() === (req as IUserRequest).user!._id) {
        const updatedPlaylist = await PlaylistsModel.findByIdAndUpdate(
          req.params.playlistID,
          req.body,
          { new: true, runValidators: true }
        );
        res.send(updatedPlaylist);
      } else {
        next(
          createHttpError(
            401,
            "This user does not have the permission to edit this playlist!"
          )
        );
      }
    } else
      next(
        createHttpError(
          404,
          `Playlist with the id ${req.params.playlistID} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// Get playlists of a User
UsersRouter.get("/:userID/playlists", JWTTokenAuth, async (req, res, next) => {
  try {
    const playlists = await PlaylistsModel.find({
      user: (req as IUserRequest).user!._id,
    });
    res.send(playlists);
  } catch (error) {
    next(error);
  }
});

export default PlaylistsRouter;
