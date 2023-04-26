import { Model, Document } from "mongoose";
import { IPlaylist } from "./IPlaylist";

export interface IUser {
  fullName: string;
  email: string;
  avatar: string;
  refreshToken: string;
  playlists: IPlaylist[];
  likedPlaylists: IPlaylist[];
}

export interface IUserDocument extends IUser, Document {}

export interface IUsersModel extends Model<IUserDocument> {
  checkCredentials(
    email: string,
    password: string
  ): Promise<IUserDocument | null>;
}
