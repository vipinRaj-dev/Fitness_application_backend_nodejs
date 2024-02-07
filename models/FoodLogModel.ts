import mongoose, { Schema } from "mongoose";

export interface FoodLogType extends Document {
  _id?: string;
  date: Date;
  foodId: mongoose.Types.ObjectId;
  status: boolean;
  timePeriod: "morning" | "afternoon" | "evening";
  time: string;
  quantity: string;
  createdAt: Date;
}

export const FoodLogSchema: Schema<FoodLogType> = new Schema({
  date: Date,
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
  status: { type: Boolean, default: false },
  timePeriod: { type: String, default: "morning" },
  time: String,
  quantity: String,
  createdAt: Date,
});

export const FoodLog = mongoose.model("FoodLog", FoodLogSchema);
