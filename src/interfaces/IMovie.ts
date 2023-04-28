import { Model } from "mongoose";

export interface IImdbMovieInfo {
  match?: string;
  meta: IImdbMovieMeta;
}

export interface IImdbMovieMeta {
  id?: string;
  name?: string;
  year?: number;
  type?: string;
  yearRange?: string | undefined;
  image: { src: string; width: number; height: number };
  starring: string;
  similarity: number;
}

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
