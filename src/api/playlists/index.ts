import express from "express";
import PlaylistsModel from "./model";
import UsersModel from "../users/model";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import UsersRouter from "../users";
import createHttpError from "http-errors";
import { IPlaylist } from "../../interfaces/IPlaylist";
import { IUser } from "../../interfaces/IUser";
import { coverUploader } from "../../lib/cloudinary";

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
PlaylistsRouter.post("/", JWTTokenAuth, async (req, res, next) => {
  try {
    const userID = (req as IUserRequest).user!._id;
    const newPlaylist = new PlaylistsModel({
      ...req.body,
      user: userID,
    });
    const { _id } = await newPlaylist.save();
    await UsersModel.findByIdAndUpdate(userID, {
      $push: { playlists: _id },
    });
    res.status(201).send({ playlistID: _id });
  } catch (error) {
    next(error);
  }
});

// Get a Playlist
PlaylistsRouter.get("/:playlistID", JWTTokenAuth, async (req, res, next) => {
  try {
    const playlist = await PlaylistsModel.findById(req.params.playlistID);
    if (playlist) res.send(playlist);
    else
      next(
        createHttpError(
          404,
          `Playlist with the ID ${req.params.playlistID} not found!`
        )
      );
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
          `Playlist with the ID ${req.params.playlistID} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// Delete a Playlist
PlaylistsRouter.delete("/:playlistID", JWTTokenAuth, async (req, res, next) => {
  try {
    const userID = (req as IUserRequest).user!._id;
    const playlist = (await PlaylistsModel.findById(
      req.params.playlistID
    )) as IPlaylist;
    if (playlist) {
      if (playlist.user.toString() === userID) {
        await PlaylistsModel.findByIdAndDelete(req.params.playlistID);
        await UsersModel.findByIdAndUpdate(userID, {
          $pull: { playlists: playlist._id },
        });
        res.status(204).send();
      } else {
        next(
          createHttpError(
            401,
            "This user does not have the permission to delete this playlist!"
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Playlist with the ID ${req.params.playlistID} not found!`
        )
      );
    }
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

// Like a playlist
PlaylistsRouter.post(
  "/:playlistID/likes",
  JWTTokenAuth,
  async (req, res, next) => {
    try {
      const userID = (req as IUserRequest).user!._id;
      const playlist = (await PlaylistsModel.findById(
        req.params.playlistID
      )) as IPlaylist;
      const user = (await UsersModel.findById(userID)) as IUser;
      if (playlist) {
        // isLike = false -> like
        // isLike = true -> throw error
        const isLiked =
          playlist.likes.some((id) => id.toString() === userID) &&
          user.likedPlaylists.some(
            (playlistID) => playlistID.toString() === req.params.playlistID
          );
        if (!isLiked) {
          await PlaylistsModel.findByIdAndUpdate(
            req.params.playlistID,
            {
              $push: { likes: userID },
            },
            { new: true, runValidators: true }
          );
          await UsersModel.findByIdAndUpdate(userID, {
            $push: { likedPlaylists: playlist._id },
          });
          res.send({ message: "Liked!" });
        } else {
          next(createHttpError(400, "You've already liked this playlist!"));
        }
      } else {
        next(
          createHttpError(
            404,
            `Playlist with the ID ${req.params.playlistID} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// Dislike a Playlist
PlaylistsRouter.delete(
  "/:playlistID/likes",
  JWTTokenAuth,
  async (req, res, next) => {
    try {
      const userID = (req as IUserRequest).user!._id;
      const playlist = (await PlaylistsModel.findById(
        req.params.playlistID
      )) as IPlaylist;
      const user = (await UsersModel.findById(userID)) as IUser;
      if (playlist) {
        // isLike = true -> dislike
        // isLike = false -> throw error
        const isLiked =
          playlist.likes.some((id) => id.toString() === userID) &&
          user.likedPlaylists.some(
            (playlistID) => playlistID.toString() === req.params.playlistID
          );
        if (isLiked) {
          await PlaylistsModel.findByIdAndUpdate(
            req.params.playlistID,
            {
              $pull: { likes: userID },
            },
            { new: true, runValidators: true }
          );
          await UsersModel.findByIdAndUpdate(userID, {
            $pull: { likedPlaylists: playlist._id },
          });
          res.send({ message: "Disliked!" });
        } else {
          next(createHttpError(400, "You've already disliked this playlist!"));
        }
      } else {
        next(
          createHttpError(
            404,
            `Playlist with the ID ${req.params.playlistID} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// Upload a cover for a Playlist
PlaylistsRouter.post(
  "/:playlistID/cover",
  JWTTokenAuth,
  coverUploader,
  async (req, res, next) => {
    try {
      if (req.file) {
        const userID = (req as IUserRequest).user!._id;
        const playlist = (await PlaylistsModel.findById(
          req.params.playlistID
        )) as IPlaylist;
        if (playlist) {
          if (playlist.user.toString() === userID) {
            await PlaylistsModel.findByIdAndUpdate(req.params.playlistID, {
              cover: req.file.path,
            });
            res.send({ coverURL: req.file.path });
          } else {
            next(
              createHttpError(
                401,
                "This user does not have the permission to add a cover for this playlist!"
              )
            );
          }
        } else {
          next(
            createHttpError(
              404,
              `Playlist with the ID ${req.params.playlistID} not found!`
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

// Remove the cover of a Playlist
PlaylistsRouter.delete(
  "/:playlistID/cover",
  JWTTokenAuth,
  async (req, res, next) => {
    try {
      const userID = (req as IUserRequest).user!._id;
      const playlist = (await PlaylistsModel.findById(
        req.params.playlistID
      )) as IPlaylist;
      if (playlist) {
        if (playlist.user.toString() === userID) {
          await PlaylistsModel.findByIdAndUpdate(req.params.playlistID, {
            cover:
              "https://static.vecteezy.com/system/resources/previews/000/421/044/large_2x/music-note-icon-vector-illustration.jpg",
          });
          res.status(204).send();
        } else {
          next(
            createHttpError(
              401,
              "This user does not have the permission to remove the cover of this playlist!"
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `Playlist with the ID ${req.params.playlistID} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
export default PlaylistsRouter;
