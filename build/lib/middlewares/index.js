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
exports.checkMovieInWL = exports.checkFollows = exports.checkIsLiked = exports.checkIsMemberOfWL = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const model_1 = __importDefault(require("../../api/watchlists/model"));
const model_2 = __importDefault(require("../../api/users/model"));
const model_3 = __importDefault(require("../../api/movies/model"));
const checkIsMemberOfWL = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.user._id;
    const WL = yield model_1.default.findById(req.params.WLID);
    if (WL) {
        if (WL.members.includes(userID)) {
            next();
        }
        else {
            next((0, http_errors_1.default)(401, "You are not a member of this watchlist!"));
        }
    }
    else {
        next((0, http_errors_1.default)(404, `Watchlist with the ID of ${req.params.WLID} not found!`));
    }
});
exports.checkIsMemberOfWL = checkIsMemberOfWL;
const checkIsLiked = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.user._id;
    const WL = yield model_1.default.findById(req.params.WLID);
    if (!WL) {
        next((0, http_errors_1.default)(404, `Watchlist with the ID ${req.params.WLID} not found!`));
    }
    else {
        const user = (yield model_2.default.findById(userID));
        const isLiked = WL.likes.includes(userID) &&
            user.likedWatchlists.includes(req.params.WLID);
        req.isLiked = isLiked;
        next();
    }
});
exports.checkIsLiked = checkIsLiked;
const checkFollows = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const u1ID = req.user._id;
    const u2ID = req.params.userID;
    if (u1ID === u2ID) {
        next((0, http_errors_1.default)(400, "You cannot follow yourself!"));
    }
    else {
        const user2 = yield model_2.default.findById(u2ID);
        if (!user2) {
            next((0, http_errors_1.default)(404, `User with the ID ${u2ID} not found!`));
        }
        else {
            const user1 = yield model_2.default.findById(u1ID);
            if (user1)
                req.user1 = user1;
            req.user2 = user2;
            // checks if user1 is following user2
            req.ImFollowingThem = user1.following.includes(u2ID);
            // checks if user2 is following user1
            req.TheyAreFollowingMe =
                user2.following.includes(u1ID);
            next();
        }
    }
});
exports.checkFollows = checkFollows;
const checkMovieInWL = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const WLID = req.params.WLID;
    const movieID = req.params.movieID;
    const WL = yield model_1.default.findById(WLID);
    if (WL) {
        req.WL = WL;
        const movie = yield model_3.default.findById(movieID);
        if (movie) {
            req.movie = movie;
            req.movieIsAlreadyIn = WL.movies.includes(movieID);
            next();
        }
        else {
            next((0, http_errors_1.default)(404, `Movie with the ID ${movieID} not found!`));
        }
    }
    else {
        next((0, http_errors_1.default)(404, `Watchlist with the ID ${WLID} not found!`));
    }
});
exports.checkMovieInWL = checkMovieInWL;
