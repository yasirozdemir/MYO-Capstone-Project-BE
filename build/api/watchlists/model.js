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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const WatchlistSchema = new mongoose_1.Schema({
    name: { type: String, required: true, default: "New Watchlist" },
    cover: {
        type: String,
        default: "https://res.cloudinary.com/yasirdev/image/upload/v1682762502/WhataMovie/watchlists/covers/watchlist_default.png",
    },
    members: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }],
    movies: [{ type: mongoose_1.default.Types.ObjectId, ref: "movie" }],
    likes: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }],
}, { timestamps: true });
WatchlistSchema.methods.toJSON = function () {
    const watchlist = this.toObject();
    delete watchlist.updatedAt;
    delete watchlist.__v;
    return watchlist;
};
exports.default = (0, mongoose_1.model)("watchlist", WatchlistSchema);
