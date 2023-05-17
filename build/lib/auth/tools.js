"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyVerificationToken = exports.createVerificationToken = exports.verifyAccessToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const { JWT_SECRET, JWT_VERIFY_SECRET } = process.env;
const createAccessToken = (payload) => new Promise((resolve, reject) => jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "1d" }, (err, token) => {
    if (err)
        reject(err);
    else
        resolve(token);
}));
exports.createAccessToken = createAccessToken;
const verifyAccessToken = (token) => new Promise((resolve, reject) => jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, payload) => {
    if (err)
        reject(err);
    else
        resolve(payload);
}));
exports.verifyAccessToken = verifyAccessToken;
const createVerificationToken = (payload) => new Promise((resolve, reject) => jsonwebtoken_1.default.sign(payload, JWT_VERIFY_SECRET, { expiresIn: "1000d" }, (err, token) => {
    if (err)
        reject(err);
    else
        resolve(token);
}));
exports.createVerificationToken = createVerificationToken;
const verifyVerificationToken = (token) => new Promise((resolve, reject) => jsonwebtoken_1.default.verify(token, JWT_VERIFY_SECRET, (err, payload) => {
    if (err)
        reject(err);
    else
        resolve(payload);
}));
exports.verifyVerificationToken = verifyVerificationToken;
