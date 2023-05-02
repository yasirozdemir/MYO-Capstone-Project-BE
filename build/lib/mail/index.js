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
exports.sendVerifyMail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
require("dotenv").config();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendVerifyMail = (userMail, verifyURL) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = {
        to: userMail,
        from: process.env.SENDGRID_MAIL,
        subject: "Welcome to What a Movie!",
        html: `<div style="display:flex; flex-direction: column; align-items: center;">
                <div style="max-width: 175px">
                    <img style="width: 100%" src="https://res.cloudinary.com/yasirdev/image/upload/v1683015717/WhataMovie/dev/logo.png" alt="logo" />
                </div>
                <p>Please verify your account by clicking <a href="${verifyURL}" style="color: #C81E1D; font-weight:bolder">this link</a></p>
           </div>`,
    };
    try {
        yield mail_1.default.send(msg);
        console.log("Verify mail sent!");
    }
    catch (error) {
        console.log(error);
    }
});
exports.sendVerifyMail = sendVerifyMail;
