import express from "express";
import MoviesModel from "./model";
import { JWTTokenAuth } from "../../lib/auth/jwt";
const q2m = require("query-to-mongo");

const MoviesRouter = express.Router();

// Get all the Movies in the DB
MoviesRouter.get("/", JWTTokenAuth, async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const options = query.options;
    const movies = await MoviesModel.find(query.criteria)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit);
    const totalMovies = await MoviesModel.countDocuments(query.criteria);
    const links = query.links(`${process.env.FE_DEV_URL}/movies`, totalMovies);
    res.send({ totalMovies, movies, links });
  } catch (error) {
    next(error);
  }
});

export default MoviesRouter;
