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
exports.movieDealer = exports.csvToArray = void 0;
const axios_1 = __importDefault(require("axios"));
const model_1 = __importDefault(require("../../api/movies/model"));
const http_errors_1 = __importDefault(require("http-errors"));
function csvToArray(csv) {
    return csv === null || csv === void 0 ? void 0 : csv.split(", ").map((el) => el.trim());
}
exports.csvToArray = csvToArray;
const movieDealer = (title, year) => __awaiter(void 0, void 0, void 0, function* () {
    let URL;
    switch (year) {
        case undefined:
            URL = `http://www.omdbapi.com/?t=${title}&type=movie&apikey=${process.env.OMDB_API_KEY}`;
            break;
        default:
            URL = `http://www.omdbapi.com/?t=${title}&y=${year}&type=movie&apikey=${process.env.OMDB_API_KEY}`;
            break;
    }
    const res = yield axios_1.default.get(URL);
    if (res.status === 200) {
        const { Title, Released, Rated, Runtime, Genre, Poster, imdbRating, imdbID, Plot, Director, Writer, Actors, } = res.data;
        const isExisted = yield model_1.default.findOne({ imdbID });
        if (!isExisted) {
            const movieInf = {
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
            const movie = new model_1.default(movieInf);
            yield movie.save();
            return movie;
        }
        else {
            const movie = isExisted;
            return movie;
        }
    }
    else {
        throw new http_errors_1.default[503]();
    }
});
exports.movieDealer = movieDealer;
