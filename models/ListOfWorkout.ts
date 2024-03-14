import mongoose, { Schema, Document } from "mongoose";

interface ListOfWorkouts extends Document {
  _id?: string;
  workoutName: string;
  targetMuscle: string;
  description: string;
  videoUrl: string;
  publicId: string;
  thumbnailUrl: string;
  createdAt: Date; 
}

const ListOfWorkoutsSchema = new Schema<ListOfWorkouts>({
  workoutName: { type: String, required: true },
  targetMuscle: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String },
  publicId: { type: String },
  thumbnailUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Workout = mongoose.model<ListOfWorkouts>(
  "Workout",
  ListOfWorkoutsSchema
);
  