import mongoose, { Schema, InferSchemaType } from "mongoose";

export const ChatSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trainerId: {
    type: Schema.Types.ObjectId,
    ref: "Trainer",
    required: true,
  },
  message: [
    {
      senderId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      receiverId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
        default: new Date(),
      },
      isSeen: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

export type chatType = InferSchemaType<typeof ChatSchema>;

export const Chat = mongoose.model("Chat", ChatSchema);
