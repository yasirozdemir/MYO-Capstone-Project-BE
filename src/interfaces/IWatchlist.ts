import { Model } from "mongoose";

export interface IWatchlist {
  name: string;
  cover: string;
  members: string[];
  movies: string[];
  likes: string[];
}

export interface IWatchlistDocument extends IWatchlist, Document {}
export interface IWatchlistsModel extends Model<IWatchlistDocument> {}
