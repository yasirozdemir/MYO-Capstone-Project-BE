import { Model, Document } from "mongoose";

export interface IMovie {
  title: string;
  released: string;
  rated: string;
  duration: string;
  genres: string[];
  poster: string;
  imdbRating: string;
  imdbID: string;
  description: string;
  director: string[];
  writer: string[];
  actors: string[];
}

export interface IMovieDocument extends IMovie, Document {}
export interface IMoviesModel extends Model<IMovieDocument> {}
