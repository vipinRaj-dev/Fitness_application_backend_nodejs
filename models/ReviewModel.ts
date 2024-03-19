import mongoose, { Schema, InferSchemaType } from "mongoose";

export const ReviewSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Trainer",
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export type review = InferSchemaType<typeof ReviewSchema>;

export const Review = mongoose.model("Review", ReviewSchema);
