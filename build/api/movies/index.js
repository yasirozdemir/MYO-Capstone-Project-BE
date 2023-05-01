"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const model_1 = __importDefault(require("./model"));
const jwt_1 = require("../../lib/auth/jwt");
const watchlists_1 = __importDefault(require("../watchlists"));
const middlewares_1 = require("../../lib/middlewares");
const http_errors_1 = __importDefault(require("http-errors"));
const q2m = require("query-to-mongo");
const MoviesRouter = express_1.default.Router();
// Get all the Movies in the DB
MoviesRouter.get("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = q2m(req.query);
        const options = query.options;
        const movies = yield model_1.default.find(query.criteria)
            .sort(options.sort)
            .skip(options.skip)
            .limit(options.limit);
        const totalMovies = yield model_1.default.countDocuments(query.criteria);
        const links = query.links(`${process.env.FE_DEV_URL}/movies`, totalMovies); // Links will be changed after DEV stage is done
        res.send({ totalMovies, movies, links });
    }
    catch (error) {
        next(error);
    }
}));
// Add a movie into a Watchlist
watchlists_1.default.post("/:WLID/movies/:movieID", jwt_1.JWTTokenAuth, middlewares_1.checkIsMemberOfWL, middlewares_1.checkMovieInWL, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.movieIsAlreadyIn) {
            const WL = req.WL;
            WL.movies = [...WL.movies, req.params.movieID];
            yield WL.save();
            res.send({ movies: WL.movies });
        }
        else {
            next((0, http_errors_1.default)(400, "This movie is already added to this watchlist!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
// Remove a movie from a Watchlist
watchlists_1.default.delete("/:WLID/movies/:movieID", jwt_1.JWTTokenAuth, middlewares_1.checkIsMemberOfWL, middlewares_1.checkMovieInWL, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.movieIsAlreadyIn) {
            const WL = req.WL;
            WL.movies = WL.movies.filter((id) => id.toString() !== req.params.movieID);
            yield WL.save();
            res.send({ movies: WL.movies });
        }
        else {
            next((0, http_errors_1.default)(400, "This movie is not into this watchlist!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = MoviesRouter;
