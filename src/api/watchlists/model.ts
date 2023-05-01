import mongoose, { Schema, model } from "mongoose";
import {
  IWatchlistDocument,
  IWatchlistsModel,
} from "../../interfaces/IWatchlist";

const WatchlistSchema = new Schema(
  {
    name: { type: String, required: true, default: "New Watchlist" },
    cover: {
      type: String,
      default:
        "https://res.cloudinary.com/yasirdev/image/upload/v1682762502/capstone/dev/cover_pwdaaj.png",
    },
    members: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    movies: [{ type: mongoose.Types.ObjectId, ref: "movie" }],
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

WatchlistSchema.methods.toJSON = function () {
  const watchlist = this.toObject();
  delete watchlist.updatedAt;
  delete watchlist.__v;
  return watchlist;
};

export default model<IWatchlistDocument, IWatchlistsModel>(
  "watchlist",
  WatchlistSchema
);
