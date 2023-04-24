import createHttpError from "http-errors";
import express from "express";
import UsersModel from "./model";
import { avatarUploader } from "../../lib/cloudinary";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import { createAccessToken, createRefreshToken } from "../../lib/auth/tools";
import passport from "passport";
import { IGoogleLoginReq } from "../../lib/auth/googleOauth";

const UsersRouter = express.Router();

// Register
UsersRouter.post("/", async (req, res, next) => {
  try {
    const emailInUse = await UsersModel.exists({ email: req.body.email });
    if (!emailInUse) {
      const newUser = new UsersModel(req.body);
      const user = await newUser.save();
      res.status(201).send({ _id: user._id });
    } else {
      next(createHttpError(400, "The email is already in use!"));
    }
  } catch (error) {
    next(error);
  }
});

// Login
UsersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id, email: user.email };
      const accessToken = await createAccessToken(payload);
      const refreshToken = await createRefreshToken(payload);
      res.send({ user, accessToken, refreshToken });
    }
  } catch (error) {
    next(error);
  }
});

// Login with Google
UsersRouter.post(
  "/googleLogin",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
  async (req, res, next) => {
    try {
      res.redirect(
        `${process.env.FE_DEV_URL}/?accessToken=${
          (req.user as IGoogleLoginReq).accessToken
        }`
      );
    } catch (error) {
      next(error);
    }
  }
);

// Get all the users in the DB
UsersRouter.get("/", JWTTokenAuth, async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

// Upload a profile picture
UsersRouter.post(
  "/me/avatar",
  JWTTokenAuth,
  avatarUploader,
  async (req, res, next) => {
    try {
      if (req.file) {
        await UsersModel.findByIdAndUpdate((req as IUserRequest).user!._id, {
          avatar: req.file.path,
        });
        res.send({ avatarURL: req.file.path });
      } else {
        next(createHttpError(400, "Please provide an image file!"));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default UsersRouter;
