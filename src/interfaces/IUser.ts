import { Model, Document } from "mongoose";
import { IPlaylist } from "./IPlayist";

export interface IUser {
  fullName: string;
  email: string;
  avatar: string;
  refreshToken: string;
  playlists: IPlaylist[];
}

export interface IUserDocument extends IUser, Document {}

export interface IUsersModel extends Model<IUserDocument> {
  checkCredentials(
    email: string,
    password: string
  ): Promise<IUserDocument | null>;
}
