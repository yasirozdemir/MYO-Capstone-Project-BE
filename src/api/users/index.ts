import createHttpError from "http-errors";
import express from "express";
import UsersModel from "./model";
import { avatarUploader } from "../../lib/cloudinary";
import { IUserRequest, JWTTokenAuth } from "../../lib/auth/jwt";
import {
  createAccessToken,
  createRefreshToken,
  createVerificationToken,
  verifyVerificationToken,
} from "../../lib/auth/tools";
import passport from "passport";
import { IGoogleLoginReq } from "../../lib/auth/googleOAuth";
import { IFollowChecks, checkFollows } from "../../lib/middlewares";
import { sendVerifyMail } from "../../lib/mail";

const UsersRouter = express.Router();

// Register
UsersRouter.post("/", async (req, res, next) => {
  try {
    const emailInUse = await UsersModel.exists({ email: req.body.email });
    if (!emailInUse) {
      const newUser = new UsersModel(req.body);
      const user = await newUser.save();
      const payload = {
        _id: user._id,
        email: user.email,
        verified: user.verified,
      };
      const accessToken = await createAccessToken(payload);
      const refreshToken = await createRefreshToken(payload);
      const verificationToken = await createVerificationToken(payload);
      const verifyURL = `${process.env.API_URL}/users/verify?token=${verificationToken}`;
      sendVerifyMail(user.email, verifyURL);
      await UsersModel.findByIdAndUpdate(user._id, {
        refreshToken: refreshToken,
      });
      res.status(201).send({
        user,
        accessToken,
        refreshToken,
      });
    } else {
      next(createHttpError(400, "The email is already in use!"));
    }
  } catch (error) {
    next(error);
  }
});

// Verify the user
UsersRouter.get("/verify", async (req, res, next) => {
  try {
    const token = req.query.token;
    if (token) {
      const { _id, email } = await verifyVerificationToken(token as string);
      const user = await UsersModel.findOneAndUpdate(
        { _id, email },
        { verified: true },
        { new: true }
      );
      if (user) {
        if (user.verified)
          res.redirect(`${process.env.FE_URL}/verified?v=true&u=true`);
        else res.redirect(`${process.env.FE_URL}/verified?v=false&u=true`);
      } else res.redirect(`${process.env.FE_URL}/verified?v=false&u=false`);
    } else {
      next(createHttpError(400, "No verification token in the URL!"));
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
      const payload = {
        _id: user._id,
        email: user.email,
        verified: user.verified,
      };
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
UsersRouter.get(
  "/googleLogin",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
  async (req, res, next) => {
    try {
      res.redirect(
        `${process.env.FE_URL}/googleRedirect?accessToken=${
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
    const user = await UsersModel.findById((req as IUserRequest).user!._id)
      .populate({
        path: "watchlists likedWatchlists",
        populate: {
          path: "members",
          model: "user",
          select: "_id name surname",
        },
        select: "_id name cover members movies likes",
      })
      .populate({
        path: "followers following",
        model: "user",
        select: "_id name surname avatar followers",
      });
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
    const user = await UsersModel.findById(req.params.userID)
      .populate({
        path: "watchlists likedWatchlists",
        populate: {
          path: "members",
          model: "user",
          select: "_id name surname",
        },
        select: "_id name cover members movies likes",
      })
      .populate({
        path: "followers following",
        model: "user",
        select: "_id name surname avatar followers",
      });
    if (user) res.send(user);
    else
      next(
        createHttpError(
          404,
          `User with the ID of ${req.params.userID} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// Upload avatar
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

// Delete current avatar
UsersRouter.delete("/me/avatar", JWTTokenAuth, async (req, res, next) => {
  try {
    await UsersModel.findByIdAndUpdate((req as IUserRequest).user!._id, {
      avatar:
        "https://res.cloudinary.com/yasirdev/image/upload/v1682762639/WhataMovie/users/avatars/user_default.jpg",
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Follow
UsersRouter.post(
  "/follow/:userID",
  JWTTokenAuth,
  checkFollows,
  async (req, res, next) => {
    // (req as IFollowChecks).user1 will follow (req as IFollowChecks).user2
    try {
      const user1 = (req as IFollowChecks).user1;
      const user2 = (req as IFollowChecks).user2;
      if (!(req as IFollowChecks).ImFollowingThem) {
        user1.following = [...user1.following, user2._id];
        await user1.save();
        user2.followers = [...user2.followers, user1._id];
        await user2.save();
        res.send({
          message: `Following ${user2.name} ${user2.surname}!`,
          followers: user2.followers,
        });
      } else {
        next(createHttpError(400, "You're already following this user!"));
      }
    } catch (error) {
      next(error);
    }
  }
);

// Unfollow
UsersRouter.delete(
  "/follow/:userID",
  JWTTokenAuth,
  checkFollows,
  async (req, res, next) => {
    // (req as IFollowChecks).user1 will unfollow (req as IFollowChecks).user2
    try {
      const user1 = (req as IFollowChecks).user1;
      const user2 = (req as IFollowChecks).user2;
      if ((req as IFollowChecks).ImFollowingThem) {
        user1.following = user1.following.filter(
          (id) => id.toString() !== user2._id.toString()
        );
        await user1.save();
        user2.followers = user2.followers.filter(
          (id) => id.toString() !== user1._id.toString()
        );
        await user2.save();
        res.send({
          message: `Unfollowed ${user2.name} ${user2.surname}!`,
          followers: user2.followers,
        });
      } else {
        next(createHttpError(400, "You've already unfollowed this user!"));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default UsersRouter;
