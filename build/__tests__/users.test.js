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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
const model_1 = __importDefault(require("../api/users/model"));
dotenv_1.default.config();
const client = (0, supertest_1.default)(server_1.expressServer);
let validID;
let accessToken;
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
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(process.env.MONGO_TEST_URL);
    const user = new model_1.default(validUser);
    const { _id } = yield user.save();
    validID = _id.toString();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield model_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
}));
describe("Test Users API", () => {
    test("login with valid credentials", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield client
            .post("/users/session")
            .send({ email: validUser.email, password: validUser.password });
        const data = res.body;
        accessToken = data.accessToken;
    }));
    test("get on users works fine", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield client
            .get("/users")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);
        expect(res.body).toBeDefined();
    }));
});
