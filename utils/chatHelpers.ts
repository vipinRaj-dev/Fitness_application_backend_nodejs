import { Chat } from "../models/ChatSchema";

export const sendAndSaveMessage = async (message: any) => {
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
    } else {
      userId = senderId;
      trainerId = receiverId;
    }

    let chat = await Chat.findOne({
      userId: userId,
      trainerId: trainerId,
    });

    if (chat) {
      chat.message.push(chatMessage);
    } else {
      chat = new Chat({
        userId: userId,
        trainerId: trainerId,
        message: [chatMessage],
      });
    }

    await chat.save();

    console.log(chat);
    if (chat) {
      return { receiverId, chatMessage };
    } else {
      console.log("no chat is there");
    }
  } catch (error) {
    console.error("Error in sending message", error);
  }
};
