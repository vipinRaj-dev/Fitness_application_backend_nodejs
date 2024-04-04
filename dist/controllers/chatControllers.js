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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = void 0;
const ChatModel_1 = require("../models/ChatModel");
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, trainerId } = req.params;
        // console.log(userId, trainerId);
        const messages = yield ChatModel_1.Chat.findOne({
            userId: userId,
            trainerId: trainerId,
        });
        // console.log(messages);
        res.status(200).json({ messages });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getMessages = getMessages;
