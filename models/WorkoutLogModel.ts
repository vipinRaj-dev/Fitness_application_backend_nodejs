import mongoose, { Schema, InferSchemaType} from "mongoose";

export interface WorkoutLogType extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  workOuts: [
    {
      workoutId: mongoose.Types.ObjectId;
      workoutSet: [
        {
          reps: number;
          weight: number;
          completedReps?: number;
        }
      ];
    }
  ]; 

  createdAt: Date;
}

export const WorkoutLogSchema = new Schema(
  {
    date: { type: Date, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    workOuts: [
      {
        workoutId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Workout",
        },
        workoutSet: [
          {
            reps: { type: Number, required: true },
            weight: { type: Number, required: true },
            completedReps: { type: Number, default: 0}, 
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export type workoutLog = InferSchemaType<typeof WorkoutLogSchema>;

export const WorkoutLog = mongoose.model("WorkoutLog", WorkoutLogSchema);
