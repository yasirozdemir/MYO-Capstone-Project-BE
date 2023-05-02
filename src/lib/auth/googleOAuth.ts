import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UsersModel from "../../api/users/model";
import { createAccessToken } from "./tools";
require("dotenv").config();

const { CLIENT_ID, CLIENT_SECRET, API_URL } = process.env;

const googleStrategy = new GoogleStrategy(
  {
    clientID: CLIENT_ID!,
    clientSecret: CLIENT_SECRET!,
    callbackURL: `${API_URL}/users/googleLogin`,
  },
  async (_, __, profile, passportNext) => {
    try {
      const { email, given_name, family_name, sub, picture } = profile._json;
      const user = await UsersModel.findOne({ email });
      if (user) {
        const accessToken = await createAccessToken({
          _id: user._id,
          email: user.email,
          verified: user.verified,
        });
        passportNext(null, { accessToken });
      } else {
        const newUser = new UsersModel({
          name: given_name,
          surname: family_name,
          email,
          avatar: picture,
          googleID: sub,
          password: Math.random().toString(36).slice(-10),
        });
        const { _id } = await newUser.save();
        const accessToken = await createAccessToken({
          _id,
          email: newUser.email,
          verified: newUser.verified,
        });
        passportNext(null, { accessToken });
      }
    } catch (error) {
      passportNext(error as Error);
    }
  }
);

export interface IGoogleLoginReq {
  accessToken: string;
}

export default googleStrategy;
