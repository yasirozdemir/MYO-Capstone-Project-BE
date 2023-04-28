import { Schema, model } from "mongoose";
import { IMovieDocument, IMoviesModel } from "../../interfaces/IMovie";

const MovieSchema = new Schema({
  title: { type: String },
  released: { type: String },
  rated: { type: String },
  duration: { type: String },
  genres: { type: Array<String>, default: [] },
  poster: { type: String },
  imdbRating: { type: String },
  imdbID: { type: String, required: true, unique: true },
  description: { type: String },
  director: { type: Array<String>, default: [] },
  writer: { type: Array<String>, default: [] },
  actors: { type: Array<String>, default: [] },
});

MovieSchema.methods.toJSON = function () {
  const movie = this.toObject();
  delete movie.__v;
  return movie;
};

export default model<IMovieDocument, IMoviesModel>("movie", MovieSchema);
