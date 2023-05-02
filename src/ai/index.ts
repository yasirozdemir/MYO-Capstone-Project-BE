import express from "express";
import createHttpError from "http-errors";
import { Configuration, OpenAIApi } from "openai";
import { IMovie } from "../interfaces/IMovie";
import { movieDealer } from "../lib/functions";

const aiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(aiConfig);
const systemPrompt = `Give the user some random movie suggestions from IMDB depending on their mood, feeling, thought or desire as an array of objects with length of 5. Movies should vary each time the user gives a new prompt.
The structure of the response should be like the following: ["name1","name2","name3","name4","name5"].
Do not include any further info or message but the array. 
If you cannot find any return "ERROR",
or if the prompt is meaningless return "INVALID_PROMPT"`;

const AiRouter = express.Router();

AiRouter.post("/prompt-to-movies", async (req, res, next) => {
  try {
    let moviesList: IMovie[] = [];
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
      console.log(arrayString);
      const setMoviePromises = JSON.parse(arrayString).map((title: string) => {
        return new Promise<void>((resolve, reject) => {
          movieDealer(title)
            .then((movie) => {
              moviesList.push(movie);
              resolve();
            })
            .catch((err) => reject(err));
        });
      });
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
