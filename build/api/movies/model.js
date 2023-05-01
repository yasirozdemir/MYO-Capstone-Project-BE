"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MovieSchema = new mongoose_1.Schema({
    title: { type: String },
    released: { type: String },
    rated: { type: String },
    duration: { type: String },
    genres: { type: (Array), default: [] },
    poster: { type: String },
    imdbRating: { type: String },
    imdbID: { type: String, required: true, unique: true },
    description: { type: String },
    director: { type: (Array), default: [] },
    writer: { type: (Array), default: [] },
    actors: { type: (Array), default: [] },
});
MovieSchema.methods.toJSON = function () {
    const movie = this.toObject();
    delete movie.__v;
    return movie;
};
exports.default = (0, mongoose_1.model)("movie", MovieSchema);
