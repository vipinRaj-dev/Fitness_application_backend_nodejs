import mongoose, { Schema } from "mongoose";

export interface AttendanceType extends Document {
  _id?: string;
  date: Date;
  status: 'present'| 'absent';
}

export const AttendanceSchema: Schema<AttendanceType> = new Schema({
  date: Date,
  status:{ type: String, default: "absent" }
});

export const Attendance = mongoose.model("Attendance", AttendanceSchema);
