import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { IUserDocument, IUsersModel } from "../../interfaces/IUser";
import createHttpError from "http-errors";

const UsersSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: {
    type: String,
    required: true,
    default:
      "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
  },
  verified: { type: Boolean, default: false },
  watchlists: { type: Array, default: [] }, // will hold object ids
  likedWatchlists: { type: Array, default: [] }, // will hold object ids
  refreshToken: { type: String },
  googleID: { type: String },
});

UsersSchema.pre("save", async function () {
  const newUser = this;
  const pw = newUser.password;
  const hashedPW = await bcrypt.hash(pw, 11);
  newUser.password = hashedPW;
});

UsersSchema.pre("findOneAndUpdate", async function () {
  const updatedUser = this.getUpdate() as { password: string };
  if (updatedUser.password) {
    const pw = updatedUser.password;
    const hashedPW = await bcrypt.hash(pw, 11);
    updatedUser.password = hashedPW;
  }
});

UsersSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

UsersSchema.static("checkCredentials", async function (email, pw) {
  const user = await this.findOne({ email });
  if (user) {
    const passwordMatch = await bcrypt.compare(pw, user.password);
    if (passwordMatch) return user;
    else throw new createHttpError[401]("Wrong password!");
  } else throw new createHttpError[401]("There's no user matching this email!");
});

export default model<IUserDocument, IUsersModel>("user", UsersSchema);
