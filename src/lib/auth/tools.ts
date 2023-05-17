import jwt from "jsonwebtoken";
require("dotenv").config();
export interface ITokenPayload {
  _id: string;
  email: string;
  verified: boolean;
}

const { JWT_SECRET, JWT_VERIFY_SECRET } = process.env;

export const createAccessToken = (payload: ITokenPayload): Promise<string> =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, JWT_SECRET!, { expiresIn: "1h" }, (err, token) => {
      if (err) reject(err);
      else resolve(token as string);
    })
  );

export const verifyAccessToken = (token: string): Promise<ITokenPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_SECRET!, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as ITokenPayload);
    })
  );

export const createVerificationToken = (
  payload: ITokenPayload
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

export const verifyVerificationToken = (
  token: string
): Promise<ITokenPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_VERIFY_SECRET!, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as ITokenPayload);
    })
  );
