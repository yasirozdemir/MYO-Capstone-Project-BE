import { Model, Document } from "mongoose";

export interface IUser {
  name: string;
  surname: string;
  email: string;
  avatar: string;
  verified: boolean;
  watchlists: string[];
  likedWatchlists: string[];
  followers: string[];
  following: string[];
}

export interface IUserDocument extends IUser, Document {}

export interface IUsersModel extends Model<IUserDocument> {
  checkCredentials(
    email: string,
    password: string
  ): Promise<IUserDocument | null>;
}
