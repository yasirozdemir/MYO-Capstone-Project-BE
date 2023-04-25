import mongoose, { Schema, model } from "mongoose";
import { IPlaylistDocument, IPlaylistsModel } from "../../interfaces/IPlayist";
import { ISong } from "../../interfaces/ISong";

const PlaylistsSchema = new Schema(
  {
    name: { type: String, required: true },
    cover: {
      type: String,
      required: true,
      default:
        "https://static.vecteezy.com/system/resources/previews/000/421/044/large_2x/music-note-icon-vector-illustration.jpg",
    },
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    songs: { type: Array<ISong>, default: [] },
  },
  { timestamps: true }
);

PlaylistsSchema.methods.toJSON = function () {
  const playlist = this.toObject();
  delete playlist.__v;
  return playlist;
};

export default model<IPlaylistDocument, IPlaylistsModel>(
  "playlist",
  PlaylistsSchema
);
