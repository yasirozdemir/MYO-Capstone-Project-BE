import createHttpError from "http-errors";
import express from "express";
import UsersModel from "./model";
import { avatarUploader } from "../../lib/cloudinary";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import { createAccessToken, createRefreshToken } from "../../lib/auth/tools";
import passport from "passport";
import { IGoogleLoginReq } from "../../lib/auth/googleOAuth";

const UsersRouter = express.Router();

// Register
UsersRouter.post("/", async (req, res, next) => {
  try {
    const emailInUse = await UsersModel.exists({ email: req.body.email });
    if (!emailInUse) {
      const newUser = new UsersModel(req.body);
      const user = await newUser.save();
      const payload = { _id: user._id, email: user.email };
      const accessToken = await createAccessToken(payload);
      const refreshToken = await createRefreshToken(payload);
      await UsersModel.findByIdAndUpdate(user._id, {
        refreshToken: refreshToken,
      });
      res.status(201).send({ user, accessToken, refreshToken });
    } else {
      next(createHttpError(400, "The email is already in use!"));
    }
  } catch (error) {
    next(error);
  }
});

// Login
UsersRouter.post("/session", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id, email: user.email };
      const accessToken = await createAccessToken(payload);
      const refreshToken = await createRefreshToken(payload);
      await UsersModel.findByIdAndUpdate(user._id, {
        refreshToken: refreshToken,
      });
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

// Log out
UsersRouter.delete("/session", JWTTokenAuth, async (req, res, next) => {
  try {
    await UsersModel.findByIdAndUpdate((req as IUserRequest).user!._id, {
      refreshToken: "",
    });
    res.send();
  } catch (error) {
    next(error);
  }
});

// Get all the users in the DB
UsersRouter.get("/", JWTTokenAuth, async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

//  Get users own info
UsersRouter.get("/me", JWTTokenAuth, async (req, res, next) => {
  try {
    const user = await UsersModel.findById((req as IUserRequest).user!._id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// Edit user
UsersRouter.put("/me", JWTTokenAuth, async (req, res, next) => {
  try {
    const user = await UsersModel.findOneAndUpdate(
      { _id: (req as IUserRequest).user!._id },
      req.body,
      { new: true, runValidators: true }
    );
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// Get a user by their ID
UsersRouter.get("/:userID", JWTTokenAuth, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userID);
    if (user) res.send(user);
    else
      next(
        createHttpError(404, `User with ID ${req.params.userID} not found!`)
      );
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
