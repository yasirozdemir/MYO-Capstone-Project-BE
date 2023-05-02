import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import UsersModel from "../../api/users/model";
import { IUserDocument } from "../../interfaces/IUser";
require("dotenv").config;
export interface TokenPayload {
  _id: string;
  email: string;
  verified: boolean;
}

const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_VERIFY_SECRET } = process.env;

export const createTokens = async (user: IUserDocument) => {
  const accessToken = await createAccessToken({
    _id: user._id,
    email: user.email,
    verified: user.verified,
  });
  const refreshToken = await createRefreshToken({
    _id: user._id,
    email: user.email,
    verified: user.verified,
  });
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

export const createAccessToken = (payload: TokenPayload): Promise<string> =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, JWT_SECRET!, { expiresIn: "1h" }, (err, token) => {
      if (err) reject(err);
      else resolve(token as string);
    })
  );

export const verifyAccessToken = (token: string): Promise<TokenPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_SECRET!, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as TokenPayload);
    })
  );

export const createRefreshToken = (payload: TokenPayload): Promise<string> =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      JWT_REFRESH_SECRET!,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      }
    )
  );

export const verifyRefreshToken = (token: string): Promise<TokenPayload> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, JWT_REFRESH_SECRET!, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as TokenPayload);
    });
  });

export const verifyAndCreateNewTokens = async (currentRefreshToken: string) => {
  try {
    const { _id } = await verifyRefreshToken(currentRefreshToken);
    const user = (await UsersModel.findById(_id)) as IUserDocument;
    if (!user) throw new createHttpError[404](`User with ${_id} not found!`);
    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      const { accessToken, refreshToken } = await createTokens(user);
      return { accessToken, refreshToken };
    }
  } catch (error) {
    throw new createHttpError[401]("Expired refresh token!");
  }
};

export const createVerificationToken = (
  payload: TokenPayload
): Promise<string> =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      JWT_VERIFY_SECRET!,
      { expiresIn: "1000d" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      }
    )
  );

export const verifyVerificationToken = (token: string): Promise<TokenPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_VERIFY_SECRET!, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as TokenPayload);
    })
  );
