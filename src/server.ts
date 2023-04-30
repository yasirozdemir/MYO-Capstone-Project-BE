import cors, { CorsOptions } from "cors";
import express from "express";
import createHttpError from "http-errors";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHandler,
  notFoundHandler,
  serviceUnavailable,
  unauthorizedHandler,
} from "./errorHandlers";
import UsersRouter from "./api/users";
import AiRouter from "./ai";
import passport from "passport";
import googleStrategy from "./lib/auth/googleOAuth";
import WatchlistsRouter from "./api/watchlists";
import MoviesRouter from "./api/movies";

const expressServer = express();
passport.use("google", googleStrategy);

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const corsOptions: CorsOptions = {
  origin: (currentOrigin, corsNext) => {
    if (!currentOrigin || whiteList.includes(currentOrigin)) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(
          400,
          `The following origin is not allowed! ${currentOrigin}`
        )
      );
    }
  },
};

expressServer.use(cors(corsOptions));
expressServer.use(express.json());

expressServer.use("/users", UsersRouter);
expressServer.use("/movies", MoviesRouter);
expressServer.use("/ai", AiRouter);
expressServer.use("/watchlists", WatchlistsRouter);

expressServer.use(badRequestHandler);
expressServer.use(unauthorizedHandler);
expressServer.use(forbiddenHandler);
expressServer.use(notFoundHandler);
expressServer.use(genericErrorHandler);
expressServer.use(serviceUnavailable);

export { expressServer };
