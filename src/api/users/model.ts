import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { IUserDocument, IUsersModel } from "../../interfaces/IUser";
const { Schema, model } = mongoose;

const UsersSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatar: {
    type: String,
    required: true,
    default:
      "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
  },
  playlists: [{ type: mongoose.Types.ObjectId, ref: "playlist" }],
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
    else return null;
  } else return null;
});

export default model<IUserDocument, IUsersModel>("user", UsersSchema);
