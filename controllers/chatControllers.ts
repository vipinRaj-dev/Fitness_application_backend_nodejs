import express from "express";
import { Chat } from "../models/ChatModel";

export const getMessages = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, trainerId } = req.params;

    // console.log(userId, trainerId);
    const messages = await Chat.findOne({
      userId: userId,
      trainerId: trainerId,
    });

    // console.log(messages);

    res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
  }
};
