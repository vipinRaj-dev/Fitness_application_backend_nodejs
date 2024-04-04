"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenVerify_1 = require("../middleware/tokenVerify");
const chatControllers_1 = require("../controllers/chatControllers");
const chatRouter = express_1.default.Router();
chatRouter.get("/getMessages/:trainerId/:userId", tokenVerify_1.tokenVerify, chatControllers_1.getMessages);
exports.default = chatRouter;
