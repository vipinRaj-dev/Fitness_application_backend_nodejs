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
exports.markAllSeen = exports.findChatDoc = exports.makeMsgSeen = exports.sendAndSaveMessage = void 0;
const ChatModel_1 = require("../models/ChatModel");
const sendAndSaveMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId, text, from } = message;
        // console.log(
        //   "senderId",
        //   senderId,
        //   "receiverId",
        //   receiverId,
        //   "text",
        //   text,
        //   "from",
        //   from
        // );
        // Create a new chat message
        const chatMessage = {
            senderId,
            receiverId,
            message: text,
            time: new Date(),
            isSeen: false,
        };
        let userId, trainerId;
        if (from === "trainer") {
            userId = receiverId;
            trainerId = senderId;
        }
        else {
            userId = senderId;
            trainerId = receiverId;
        }
        let chat = yield ChatModel_1.Chat.findOne({
            userId: userId,
            trainerId: trainerId,
        });
        if (chat) {
            chat.message.push(chatMessage);
        }
        else {
            chat = new ChatModel_1.Chat({
                userId: userId,
                trainerId: trainerId,
                message: [chatMessage],
            });
        }
        chat = yield chat.save();
        const savedMessageId = chat.message[chat.message.length - 1]._id;
        if (chat) {
            return { receiverId, chatMessage, savedMessageId };
        }
        else {
            console.log("no chat is there");
        }
    }
    catch (error) {
        console.error("Error in sending message", error);
    }
});
exports.sendAndSaveMessage = sendAndSaveMessage;
const makeMsgSeen = (senderId, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("makeMsgSeen==========================");
        // console.log("senderId", senderId, "receiverId", receiverId);
        const chat = yield ChatModel_1.Chat.findOne({
            $or: [
                { userId: senderId, trainerId: receiverId },
                { userId: receiverId, trainerId: senderId },
            ],
        });
        if (!chat) {
            console.log("no chat found");
            return;
        }
        else {
            chat.message.forEach((msg) => __awaiter(void 0, void 0, void 0, function* () {
                if (msg.senderId.toString() === receiverId.toString()) {
                    msg.isSeen = true;
                }
            }));
            yield chat.save();
            return { status: "success" };
        }
    }
    catch (error) {
        console.error("Error in marking message seen", error);
    }
});
exports.makeMsgSeen = makeMsgSeen;
const findChatDoc = (trainerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield ChatModel_1.Chat.findOne({
            userId: userId,
            trainerId: trainerId,
        });
        return chat;
    }
    catch (error) {
        console.error("Error in finding chat doc", error);
    }
});
exports.findChatDoc = findChatDoc;
const markAllSeen = (chatDoc, from) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        chatDoc === null || chatDoc === void 0 ? void 0 : chatDoc.message.forEach((msg) => __awaiter(void 0, void 0, void 0, function* () {
            if (msg.senderId.toString() !== from.toString()) {
                msg.isSeen = true;
            }
        }));
        yield chatDoc.save();
    }
    catch (error) {
        console.error("Error in marking all seen", error);
    }
});
exports.markAllSeen = markAllSeen;
