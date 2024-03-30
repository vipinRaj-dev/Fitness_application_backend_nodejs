import mongoose, { Schema } from "mongoose";

export interface AttendanceType extends Document {
  _id?: string;
  date: Date;
  userId: mongoose.Types.ObjectId;
  isPresent: boolean;
  workOutLogs?: mongoose.Types.ObjectId;
  foodLogs?: [mongoose.Types.ObjectId];
  notCompleteReason?: string;
}

export const AttendanceSchema: Schema<AttendanceType> = new Schema({
  date: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPresent: { type: Boolean, default: false },
  workOutLogs: { type: mongoose.Schema.Types.ObjectId, ref: "WorkoutLog" },
  foodLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodLog" }],
  notCompleteReason: { type: String, default: "" },
});

export const Attendance = mongoose.model("Attendance", AttendanceSchema);
