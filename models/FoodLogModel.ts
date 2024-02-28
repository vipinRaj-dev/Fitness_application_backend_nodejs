import mongoose, { Schema } from "mongoose";

export interface FoodLogType extends Document {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  foodId: mongoose.Types.ObjectId;
  status: boolean;
  timePeriod: "morning" | "afternoon" | "evening" | "";
  time: string;
  quantity: string;
  createdAt: Date;
}

export const FoodLogSchema: Schema<FoodLogType> = new Schema(
  {
    date: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    status: { type: Boolean, default: false },
    timePeriod: { type: String, default: "" },
    time: String,
    quantity: String,
  },
  { timestamps: true }
);

export const FoodLog = mongoose.model("FoodLog", FoodLogSchema);
