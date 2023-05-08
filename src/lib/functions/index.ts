import axios from "axios";
import MoviesModel from "../../api/movies/model";
import createHttpError from "http-errors";
import { IMovie } from "../../interfaces/IMovie";

export function csvToArray(csv: string) {
  return csv?.split(", ").map((el) => el.trim());
}

export const movieDealer = async (title: string, year?: string) => {
  let URL: string;
  switch (year) {
    case undefined:
      URL = `http://www.omdbapi.com/?t=${title}&type=movie&apikey=${process.env.OMDB_API_KEY}`;
      break;
    default:
      URL = `http://www.omdbapi.com/?t=${title}&y=${year}&type=movie&apikey=${process.env.OMDB_API_KEY}`;
      break;
  }
  const res = await axios.get(URL);
  if (res.status === 200) {
    const {
      Title,
      Released,
      Rated,
      Runtime,
      Genre,
      Poster,
      imdbRating,
      imdbID,
      Plot,
      Director,
      Writer,
      Actors,
    } = res.data;
    const isExisted = await MoviesModel.findOne({ imdbID });
    if (!isExisted) {
      const movieInf: IMovie = {
        title: Title,
        released: Released,
        rated: Rated,
        duration: Runtime,
        genres: csvToArray(Genre),
        poster: Poster,
        imdbRating,
        imdbID,
        description: Plot,
        director: csvToArray(Director),
        writer: csvToArray(Writer),
        actors: csvToArray(Actors),
      };
      const movie = new MoviesModel(movieInf);
      await movie.save();
      return movie;
    } else {
      const movie = isExisted;
      return movie;
    }
  } else {
    throw new createHttpError[503]();
  }
};
