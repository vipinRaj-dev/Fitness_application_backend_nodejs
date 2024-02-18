import mongoose, { Schema, Document } from 'mongoose';

interface ListOfWorkouts extends Document {
  _id?: string;
  workoutName: string;
  targetMuscle: string;
  description: string;
  photoUrl: string;
  videoUrl: string;
  createdAt: Date;
}

const ListOfWorkoutsSchema = new Schema<ListOfWorkouts>({
  workoutName: { type: String, required: true },
  targetMuscle: { type: String, required: true },
  description: { type: String, required: true },
  photoUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Workout = mongoose.model<ListOfWorkouts>('Workout', ListOfWorkoutsSchema);