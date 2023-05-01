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
const jwt_1 = require("../../lib/auth/jwt");
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../users/model"));
const users_1 = __importDefault(require("../users"));
const middlewares_1 = require("../../lib/middlewares");
const http_errors_1 = __importDefault(require("http-errors"));
const cloudinary_1 = require("../../lib/cloudinary");
const q2m = require("query-to-mongo");
// I'll call Watchlist WL
const WLRouter = express_1.default.Router();
// Get all the Watchlists in the DB
WLRouter.get("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = q2m(req.query);
        const WLs = yield model_1.default.find(query.criteria).populate("members", "_id name surname avatar");
        res.send(WLs);
    }
    catch (error) {
        next(error);
    }
}));
// Create a Watchlist
WLRouter.post("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.user;
        const newWL = new model_1.default(Object.assign(Object.assign({}, req.body), { members: [userID] }));
        const { _id } = yield newWL.save();
        yield model_2.default.findByIdAndUpdate(userID, { $push: { watchlists: _id } });
        res.status(201).send({ watchlistID: _id });
    }
    catch (error) {
        next(error);
    }
}));
// Get a Watchlist with it's ID
WLRouter.get("/:WLID", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const WL = yield model_1.default.findById(req.params.WLID);
        if (WL)
            res.send(WL);
        else
            next((0, http_errors_1.default)(404, `Watchlist with the ID of ${req.params.WLID} not found!`));
    }
    catch (error) {
        next(error);
    }
}));
// Get all the Watchlists that the User is a member of
users_1.default.get("/:userID/watchlists", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.userID;
        const WLs = yield model_1.default.find({ members: { $in: [userID] } });
        res.send(WLs);
    }
    catch (error) {
        next(error);
    }
}));
// Edit a Watchlist
WLRouter.put("/:WLID", jwt_1.JWTTokenAuth, middlewares_1.checkIsMemberOfWL, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const watchlist = yield model_1.default.findByIdAndUpdate(req.params.WLID, req.body, { new: true, runValidators: true });
        res.send(watchlist);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a Watchlist
WLRouter.delete("/:WLID", jwt_1.JWTTokenAuth, middlewares_1.checkIsMemberOfWL, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedWL = yield model_1.default.findByIdAndDelete(req.params.WLID);
        if (deletedWL)
            res.status(204).send();
        else
            next((0, http_errors_1.default)(404, `Watchlist with the ID of ${req.params.WLID} not found!`));
    }
    catch (error) {
        next(error);
    }
}));
// Like a Watchlist
WLRouter.post("/:WLID/likes", jwt_1.JWTTokenAuth, middlewares_1.checkIsLiked, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.isLiked) {
            const userID = req.user._id;
            yield model_1.default.findByIdAndUpdate(req.params.WLID, {
                $push: { likes: userID },
            });
            yield model_2.default.findByIdAndUpdate(userID, {
                $push: { likedWatchlists: req.params.WLID },
            });
            res.send({ message: "Liked!" });
        }
        else {
            next((0, http_errors_1.default)(400, "You've already liked this watchlist!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
// Dislike a Watchlist
WLRouter.delete("/:WLID/likes", jwt_1.JWTTokenAuth, middlewares_1.checkIsLiked, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.isLiked) {
            const userID = req.user._id;
            yield model_1.default.findByIdAndUpdate(req.params.WLID, {
                $pull: { likes: userID },
            });
            yield model_2.default.findByIdAndUpdate(userID, {
                $pull: { likedWatchlists: req.params.WLID },
            });
            res.send({ message: "Disliked!" });
        }
        else {
            next((0, http_errors_1.default)(400, "You've already disliked this watchlist!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
// Upload a cover for a Watchlist
WLRouter.post("/:WLID/cover", jwt_1.JWTTokenAuth, middlewares_1.checkIsMemberOfWL, cloudinary_1.coverUploader, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.file) {
            const WL = yield model_1.default.findById(req.params.WLID);
            if (WL) {
                WL.cover = req.file.path;
                yield WL.save();
                res.send({ cover: req.file.path });
            }
            else {
                next((0, http_errors_1.default)(404, `Watchlist with the ID of ${req.params.WLID} not found!`));
            }
        }
        else {
            next((0, http_errors_1.default)(400, "Please provide an image file!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
// Remove the cover of a Watchlist
WLRouter.delete("/:WLID/cover", jwt_1.JWTTokenAuth, middlewares_1.checkIsMemberOfWL, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const WL = yield model_1.default.findById(req.params.WLID);
        if (WL) {
            WL.cover =
                "https://res.cloudinary.com/yasirdev/image/upload/v1682762502/WhataMovie/watchlists/covers/watchlist_default.png";
            yield WL.save();
            res.status(204).send();
        }
        else {
            next((0, http_errors_1.default)(404, `Watchlist with the ID of ${req.params.WLID} not found!`));
        }
    }
    catch (error) {
        next(error);
    }
}));
// Add a new member to the Watchlist (only if they are following the user)
WLRouter.post("/:WLID/members/:userID", jwt_1.JWTTokenAuth, middlewares_1.checkIsMemberOfWL, middlewares_1.checkFollows, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.TheyAreFollowingMe) {
            const WL = yield model_1.default.findById(req.params.WLID);
            if (WL) {
                const user2 = req.user2;
                if (!WL.members.includes(req.params.userID)) {
                    WL.members = [...WL.members, req.params.userID];
                    yield WL.save();
                    user2.watchlists = [...user2.watchlists, req.params.WLID];
                    yield user2.save();
                    res.send(WL.members);
                }
                else {
                    next((0, http_errors_1.default)(400, "This user is already a member of this watchlist!"));
                }
            }
            else {
                next((0, http_errors_1.default)(404, `Watchlist with the ID of ${req.params.WLID} not found!`));
            }
        }
        else {
            next((0, http_errors_1.default)(400, "The user is not following you, you can't add them as a member!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = WLRouter;
