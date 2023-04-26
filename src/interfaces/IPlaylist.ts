import { Model } from "mongoose";
import { ISong } from "./ISong";
import { IUser } from "./IUser";

export interface IPlaylist {
  _id: string;
  name: string;
  cover: string;
  user: string;
  songs: Array<ISong>;
  likes: Array<string>;
}

export interface IPlaylistDocument extends IUser, Document {}
export interface IPlaylistsModel extends Model<IPlaylistDocument> {}
