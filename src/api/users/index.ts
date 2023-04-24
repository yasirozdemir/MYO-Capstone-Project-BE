import createHttpError from "http-errors";
import express from "express";
import UsersModel from "./model";

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

// Get all the users in the DB
UsersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

export default UsersRouter;
