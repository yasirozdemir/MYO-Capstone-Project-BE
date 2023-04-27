import express from "express";
import createHttpError from "http-errors";
import { Configuration, OpenAIApi } from "openai";
import { IImdbMovieInfo, IImdbMovieMeta } from "../interfaces/IMovie";
const nameToImdb = require("name-to-imdb");

const aiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(aiConfig);
const systemPrompt = `Give the user some random movie suggestions from IMDB depending on their mood, feeling, thought or desire as an array of objects with length of 5. Movies should vary each time the user gives a new prompt.
The structure of the response should be like the following: [{name:""},{name:""},{name:""},{name:""},{name:""}] as JSON.
Do not include any further info or message but the array. 
If you cannot find any return "ERROR",
or if the prompt is meaningless return "INVALID_PROMPT"`;

const AiRouter = express.Router();

let moviesList: IImdbMovieMeta[] = [];

AiRouter.post("/prompt-to-movies", async (req, res, next) => {
  try {
    const prompt = req.body.prompt;
    const completion = await openai.createChatCompletion({
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
    const message = completion.data.choices[0].message?.content;
    if (message && message.includes("[") && message.includes("]")) {
      const start = message.indexOf("[");
      const end = message.indexOf("]");
      const arrayString = message.substring(start, end + 1);
      const setMoviePromises = JSON.parse(arrayString).map(
        (movie: { name: string }) => {
          return new Promise<void>((resolve, reject) => {
            nameToImdb(
              { name: movie.name },
              (err: Error, _: string, info: IImdbMovieInfo) => {
                if (!err) {
                  moviesList.push(info.meta);
                  resolve();
                } else {
                  reject(err);
                }
              }
            );
          });
        }
      );
      await Promise.all(setMoviePromises);
      res.send({ moviesList });
      moviesList = [];
    } else {
      next(createHttpError(400, "Invalid prompt!"));
    }
  } catch (error) {
    next(error);
  }
});

export default AiRouter;
