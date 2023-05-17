"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_errors_1 = __importDefault(require("http-errors"));
const UsersSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
        type: String,
        required: true,
        default: "https://res.cloudinary.com/yasirdev/image/upload/v1684314041/WhataMovie/users/avatars/user_default.jpg",
    },
    verified: { type: Boolean, default: false },
    watchlists: [{ type: mongoose_1.default.Types.ObjectId, ref: "watchlist" }],
    likedWatchlists: [{ type: mongoose_1.default.Types.ObjectId, ref: "watchlist" }],
    followers: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }],
    googleID: { type: String },
});
UsersSchema.pre("save", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const newUser = this;
        if (newUser.isModified("password")) {
            const pw = newUser.password;
            const hashedPW = yield bcrypt_1.default.hash(pw, 11);
            newUser.password = hashedPW;
        }
    });
});
UsersSchema.pre("findOneAndUpdate", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedUser = this.getUpdate();
        if (updatedUser && updatedUser.password) {
            const pw = updatedUser.password;
            const hashedPW = yield bcrypt_1.default.hash(pw, 11);
            updatedUser.password = hashedPW;
        }
    });
});
UsersSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};
UsersSchema.static("checkCredentials", function (email, pw) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findOne({ email });
        if (user) {
            const passwordMatch = yield bcrypt_1.default.compare(pw, user.password);
            if (passwordMatch)
                return user;
            else
                throw new http_errors_1.default[400]("Wrong password!");
        }
        else
            throw new http_errors_1.default[400]("Wrong email!");
    });
});
exports.default = (0, mongoose_1.model)("user", UsersSchema);
