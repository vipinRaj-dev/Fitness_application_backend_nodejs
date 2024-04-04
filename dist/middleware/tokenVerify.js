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
exports.tokenVerify = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("yes token verified");
    try {
        const tokenHeader = req.headers.authorization;
        // console.log(tokenHeader  , req.headers);
        if (!tokenHeader) {
            return res.status(401).json({ msg: "Not authorized" });
        }
        const words = tokenHeader.split(" ");
        // if (words.length !== 2 || typeof words[1] !== "string") {
        //   return res.status(401).json({ msg: "Invalid token format" });
        // }
        const secretkey = process.env.JWT_SECRET_KEY;
        if (secretkey) {
            if (typeof words[1] !== "string" || words[1].split(".").length !== 3) {
                return res.status(401).json({ msg: "Invalid token format" });
            }
            else {
                const decode = jsonwebtoken_1.default.verify(words[1], secretkey);
                req.headers["user"] = decode;
            }
            // console.log(decode);
            // {
            //   email: 'admin@gmail.com',
            //   role: 'admin',
            //   userId: '65c48928c4133be373d8cb8b',
            //   iat: 1707568108
            // }
            next();
        }
        else {
            return res
                .status(500)
                .json({ msg: "Server error. JWT secret key is missing." });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Access denied" });
    }
});
exports.tokenVerify = tokenVerify;
