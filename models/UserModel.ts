import mongoose, { Schema, Document } from "mongoose";


import { Attendance, AttendanceType } from "./AttendanceModel";
import { WorkoutLog, WorkoutLogType } from "./WorkoutLogModel";
import { FoodLog, FoodLogType } from "./FoodLogModel";



export interface UserType extends Document {  
  _id?: string;
  admissionNumber?: number;
  name: string;
  email: string;
  mobileNumber?: number;
  password: string;
  weight?: number;
  height?: number;
  role:string;
  userBlocked: boolean;
  healthIssues?: string[];
  planSelected: "premiumUser" | "normalUser";
  dueDate?: Date;
  vegetarian?: boolean;
  profileImage?: string;
  attendance?: [AttendanceType];
  workOutLogs?: [WorkoutLogType];
  foodLogs?: [FoodLogType];
  createdAt?: Date;
  updatedAt?: Date;
}



// schema design
const UserSchema: Schema<UserType> = new Schema(
  {
    admissionNumber: Number,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: Number,
    password: { type: String, required: true },
    weight: { type: Number, default: 0 }, 
    height: { type: Number, default: 0 },
    role: { type: String, default: "user" },
    userBlocked: { type: Boolean, default: false },
    healthIssues: { type: [String], default: [] },
    planSelected: {
      type: String,
      enum: ["premiumUser", "normalUser"],
      default: "normalUser",
    },
    dueDate: Date,
    vegetarian: Boolean,
    profileImage: String,
    attendance: [
      {
        type: Schema.Types.ObjectId,
        ref: Attendance,
      },
    ],
    workOutLogs: [
      {
        type: Schema.Types.ObjectId,
        ref: WorkoutLog,
      },
    ],
    foodLogs: [
      {
        type: Schema.Types.ObjectId,
        ref: FoodLog,
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model<UserType>("User", UserSchema);
