import mongoose from "mongoose";
import dotenv from "dotenv";
import supertest from "supertest";
import { expressServer } from "../server";
import UsersModel from "../api/users/model";

dotenv.config();
const client = supertest(expressServer);

let validID: string;
let accessToken: string;

const validUser = {
  name: "Test",
  surname: "Test",
  email: "test@test.com",
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
  test("login with valid credentials", async () => {
    const res = await client
      .post("/users/session")
      .send({ email: validUser.email, password: validUser.password });
    const data = res.body;
    accessToken = data.accessToken;
  });
  test("get on users works fine", async () => {
    const res = await client
      .get("/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });
});
