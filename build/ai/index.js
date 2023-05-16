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
const http_errors_1 = __importDefault(require("http-errors"));
const openai_1 = require("openai");
const functions_1 = require("../lib/functions");
const aiConfig = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(aiConfig);
const systemPrompt = `Give the user some random movie suggestions from IMDB depending on their mood, feeling, thought or desire as an array of objects with length of 5. Movies should vary each time the user gives a new prompt.
The structure of the response should be like the following: ["name1","name2","name3","name4","name5"].
Do not include any further info or message but the array. 
If you cannot find any return "ERROR",
or if the prompt is meaningless return "INVALID_PROMPT"`;
const AiRouter = express_1.default.Router();
AiRouter.post("/prompt-to-movies", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let moviesList = [];
        const prompt = req.body.prompt;
        const completion = yield openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        const message = (_a = completion.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
        if (message && message.includes("[") && message.includes("]")) {
            const start = message.indexOf("[");
            const end = message.indexOf("]");
            const arrayString = message.substring(start, end + 1);
            console.log(arrayString);
            const setMoviePromises = JSON.parse(arrayString).map((title) => {
                return new Promise((resolve, reject) => {
                    (0, functions_1.movieDealer)(title)
                        .then((movie) => {
                        moviesList.push(movie);
                        resolve();
                    })
                        .catch((err) => reject(err));
                });
            });
            yield Promise.all(setMoviePromises);
            res.send({ moviesList });
            moviesList = [];
        }
        else {
            next((0, http_errors_1.default)(400, "Invalid prompt!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = AiRouter;
