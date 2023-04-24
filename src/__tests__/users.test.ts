import mongoose from "mongoose";
import dotenv from "dotenv";
import supertest from "supertest";
import { expressServer } from "../server";
import UsersModel from "../api/users/model";

dotenv.config();
const client = supertest(expressServer);

let validID;

const validUser = {
  fullName: "Test",
  email: "valid@user.com",
  password: "123456",
  playlists: [],
};

const invalidUser = {
  email: "invalid@user.com",
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URL!);
  const user = new UsersModel(validUser);
  const { _id } = await user.save();
  validID = _id.toString();
});

afterAll(async () => {
  await UsersModel.deleteMany();
  await mongoose.connection.close();
});

describe("Test Users API", () => {
  test("get on users works fine", async () => {
    const res = await client.get("/users").expect(200);
    expect(res.body).toBeDefined();
  });
});
