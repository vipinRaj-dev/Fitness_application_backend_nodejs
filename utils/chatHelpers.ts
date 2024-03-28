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

    chat = await chat.save();

    const savedMessageId = chat.message[chat.message.length - 1]._id;

    if (chat) {
      return { receiverId, chatMessage, savedMessageId };
    } else {
      console.log("no chat is there");
    }
  } catch (error) {
    console.error("Error in sending message", error);
  }
};

export const makeMsgSeen = async (senderId: string, receiverId: string) => {
  try {
    console.log("makeMsgSeen==========================");
    console.log("senderId", senderId, "receiverId", receiverId);

    const chat = await Chat.findOne({
      $or: [
        { userId: senderId, trainerId: receiverId },
        { userId: receiverId, trainerId: senderId },
      ],
    });

    if (!chat) {
      console.log("no chat found");
      return;
    } else {
      chat.message.forEach(async (msg) => {
        if (msg.senderId.toString() === receiverId.toString()) {
          msg.isSeen = true;
        }
      });

      await chat.save();
      return { status: "success" };
    }
  } catch (error) {
    console.error("Error in marking message seen", error);
  }
};

export const findChatDoc = async (trainerId: string, userId: string) => {
  try {
    const chat = await Chat.findOne({
      userId: userId,
      trainerId: trainerId,
    });

  
    return chat;
  } catch (error) {
    console.error("Error in finding chat doc", error);
  }
};

export const markAllSeen = async (chatDoc: any, from: string) => {
  try {
    chatDoc.message.forEach(async (msg) => {
      if (msg.senderId.toString() !== from.toString()) {
        msg.isSeen = true;
      }
    });

    await chatDoc.save();
  } catch (error) {
    console.error("Error in marking all seen", error);
  }
}
