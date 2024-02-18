import mongoose, { Schema } from "mongoose";

export interface WorkoutLogType extends Document {
  _id?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  date: Date;
  workoutId: mongoose.Types.ObjectId;
  workoutSet: [[number, number]];
  iscompleted: boolean;
  createdAt: Date;
}

export const WorkoutLogSchema: Schema<WorkoutLogType> = new Schema(
  {
    date: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Workout" },
    workoutSet: [[Number, Number]],
    iscompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const WorkoutLog = mongoose.model("WorkoutLog", WorkoutLogSchema);
