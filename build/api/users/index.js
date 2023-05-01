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
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const model_1 = __importDefault(require("./model"));
const cloudinary_1 = require("../../lib/cloudinary");
const jwt_1 = require("../../lib/auth/jwt");
const tools_1 = require("../../lib/auth/tools");
const passport_1 = __importDefault(require("passport"));
const middlewares_1 = require("../../lib/middlewares");
const UsersRouter = express_1.default.Router();
// Register
UsersRouter.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailInUse = yield model_1.default.exists({ email: req.body.email });
        if (!emailInUse) {
            const newUser = new model_1.default(req.body);
            const user = yield newUser.save();
            const payload = { _id: user._id, email: user.email };
            const accessToken = yield (0, tools_1.createAccessToken)(payload);
            const refreshToken = yield (0, tools_1.createRefreshToken)(payload);
            yield model_1.default.findByIdAndUpdate(user._id, {
                refreshToken: refreshToken,
            });
            res.status(201).send({ user, accessToken, refreshToken });
        }
        else {
            next((0, http_errors_1.default)(400, "The email is already in use!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
// Login
UsersRouter.post("/session", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield model_1.default.checkCredentials(email, password);
        if (user) {
            const payload = { _id: user._id, email: user.email };
            const accessToken = yield (0, tools_1.createAccessToken)(payload);
            const refreshToken = yield (0, tools_1.createRefreshToken)(payload);
            yield model_1.default.findByIdAndUpdate(user._id, {
                refreshToken: refreshToken,
            });
            res.send({ user, accessToken, refreshToken });
        }
    }
    catch (error) {
        next(error);
    }
}));
// Login with Google
UsersRouter.get("/googleLogin", passport_1.default.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
}), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.redirect(`${process.env.FE_DEV_URL}/googleRedirect?accessToken=${
        // change it after DEV stage is done
        req.user.accessToken}`);
    }
    catch (error) {
        next(error);
    }
}));
// Log out
UsersRouter.delete("/session", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield model_1.default.findByIdAndUpdate(req.user._id, {
            refreshToken: "",
        });
        res.send();
    }
    catch (error) {
        next(error);
    }
}));
// Get all the users in the DB
UsersRouter.get("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield model_1.default.find();
        res.send(users);
    }
    catch (error) {
        next(error);
    }
}));
//  Get users own info
UsersRouter.get("/me", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield model_1.default.findById(req.user._id);
        res.send(user);
    }
    catch (error) {
        next(error);
    }
}));
// Edit user
UsersRouter.put("/me", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield model_1.default.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true, runValidators: true });
        res.send(user);
    }
    catch (error) {
        next(error);
    }
}));
// Get a user by their ID
UsersRouter.get("/:userID", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield model_1.default.findById(req.params.userID);
        if (user)
            res.send(user);
        else
            next((0, http_errors_1.default)(404, `User with the ID of ${req.params.userID} not found!`));
    }
    catch (error) {
        next(error);
    }
}));
// Upload avatar
UsersRouter.post("/me/avatar", jwt_1.JWTTokenAuth, cloudinary_1.avatarUploader, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.file) {
            yield model_1.default.findByIdAndUpdate(req.user._id, {
                avatar: req.file.path,
            });
            res.send({ avatarURL: req.file.path });
        }
        else {
            next((0, http_errors_1.default)(400, "Please provide an image file!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
// Delete current avatar
UsersRouter.delete("/me/avatar", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield model_1.default.findOneAndUpdate({ _id: req.user._id }, {
            avatar: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
// Follow
UsersRouter.post("/follow/:userID", jwt_1.JWTTokenAuth, middlewares_1.checkFollows, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // (req as IFollowChecks).user1 will follow (req as IFollowChecks).user2
    try {
        const user1 = req.user1;
        const user2 = req.user2;
        if (!req.ImFollowingThem) {
            user1.following = [...user1.following, user2._id];
            yield user1.save();
            user2.followers = [...user2.followers, user1._id];
            yield user2.save();
            res.send({ message: "Followed!" });
        }
        else {
            next((0, http_errors_1.default)(400, "You're already following this user!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
// Unfollow
UsersRouter.delete("/follow/:userID", jwt_1.JWTTokenAuth, middlewares_1.checkFollows, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // (req as IFollowChecks).user1 will unfollow (req as IFollowChecks).user2
    try {
        const user1 = req.user1;
        const user2 = req.user2;
        if (req.ImFollowingThem) {
            user1.following = user1.following.filter((id) => id.toString() !== user2._id.toString());
            yield user1.save();
            user2.followers = user2.followers.filter((id) => id.toString() !== user1._id.toString());
            yield user2.save();
            res.send({ message: "Unfollowed!" });
        }
        else {
            next((0, http_errors_1.default)(400, "You've already unfollowed this user!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = UsersRouter;
