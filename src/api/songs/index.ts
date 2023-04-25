import express from "express";
import PlaylistsModel from "../playlists/model";
import { IPlaylist } from "../../interfaces/IPlayist";
import createHttpError from "http-errors";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";

const SongsRouter = express.Router();

// Add a Song into a Playlist
SongsRouter.post("/:playlistID/songs", JWTTokenAuth, async (req, res, next) => {
  try {
    const playlist = (await PlaylistsModel.findById(
      req.params.playlistID
    )) as IPlaylist;
    if (playlist) {
      if (playlist.user.toString() === (req as IUserRequest).user!._id) {
        if (!playlist.songs.some((song) => song.id === req.body.id)) {
          const updatedPlaylist = (await PlaylistsModel.findByIdAndUpdate(
            req.params.playlistID,
            {
              $push: { songs: req.body },
            },
            { new: true, runValidators: true }
          )) as IPlaylist;
          res.send(updatedPlaylist.songs);
        } else {
          next(createHttpError(400, "This is already in your playlist!"));
        }
      } else {
        next(
          createHttpError(
            401,
            "This user does not have the permission to add a song into this playlist!"
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Playlist with the id ${req.params.playlistID} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// Remove a Song from a Playlist
SongsRouter.delete("/:playlistID/songs", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

export default SongsRouter;
