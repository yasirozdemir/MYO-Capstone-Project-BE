"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressServer = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const errorHandlers_1 = require("./errorHandlers");
const users_1 = __importDefault(require("./api/users"));
const ai_1 = __importDefault(require("./ai"));
const passport_1 = __importDefault(require("passport"));
const googleOAuth_1 = __importDefault(require("./lib/auth/googleOAuth"));
const watchlists_1 = __importDefault(require("./api/watchlists"));
const movies_1 = __importDefault(require("./api/movies"));
const expressServer = (0, express_1.default)();
exports.expressServer = expressServer;
passport_1.default.use("google", googleOAuth_1.default);
const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const corsOptions = {
    origin: (currentOrigin, corsNext) => {
        if (!currentOrigin || whiteList.includes(currentOrigin)) {
            corsNext(null, true);
        }
        else {
            corsNext((0, http_errors_1.default)(400, `The following origin is not allowed! ${currentOrigin}`));
        }
    },
};
expressServer.use((0, cors_1.default)(corsOptions));
expressServer.use(express_1.default.json());
expressServer.use("/users", users_1.default);
expressServer.use("/movies", movies_1.default);
expressServer.use("/ai", ai_1.default);
expressServer.use("/watchlists", watchlists_1.default);
expressServer.use(errorHandlers_1.badRequestHandler);
expressServer.use(errorHandlers_1.unauthorizedHandler);
expressServer.use(errorHandlers_1.forbiddenHandler);
expressServer.use(errorHandlers_1.notFoundHandler);
expressServer.use(errorHandlers_1.genericErrorHandler);
expressServer.use(errorHandlers_1.serviceUnavailable);
