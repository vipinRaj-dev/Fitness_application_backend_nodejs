import mongoose, { Schema } from "mongoose";

export interface WorkoutLogType extends Document {
  _id?: string;
  date: Date;
  workoutId: mongoose.Types.ObjectId;
  workoutSet: [[number, number]];
  status: "Completed" | "Notcompleted";
  createdAt: Date;
}

export const WorkoutLogSchema: Schema<WorkoutLogType> = new Schema({
  date: Date,
  workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Workout" },
  workoutSet: [[Number, Number]],
  status: { type: String, default: "Notcompleted" },
  createdAt: Date,
});

export const WorkoutLog = mongoose.model("WorkoutLog", WorkoutLogSchema);
