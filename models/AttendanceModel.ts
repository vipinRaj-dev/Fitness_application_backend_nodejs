import mongoose, { Schema } from "mongoose";
import { WorkoutLogType } from "./WorkoutLogModel";
import { FoodLogType } from "./FoodLogModel";

export interface AttendanceType extends Document {
  _id?: string;
  date: Date;
  userId: mongoose.Types.ObjectId;  
  isPresent : boolean;
  workOutLogs?: [mongoose.Types.ObjectId];
  foodLogs?: [mongoose.Types.ObjectId];
}


export const AttendanceSchema: Schema<AttendanceType> = new Schema({
  date: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPresent: { type: Boolean, default: false },
  workOutLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "WorkoutLog" }],
  foodLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodLog" }],
});

export const Attendance = mongoose.model("Attendance", AttendanceSchema);
