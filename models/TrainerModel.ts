import mongoose, { Document, Schema } from "mongoose";

export interface TrainerType extends Document {
  _id?: string;
  password: string;
  email: string;
  name: string;
  mobileNumber?: number;
  age?: number;
  role: string;
  isBlocked: boolean;
  profilePicture: string;
  publicId?: string;
  experience: number;
  specializedIn: string;
  price: number;
  description: string;
  certifications: CertificationType[];
  transformationClients: TransformationClientType[];
  clients: mongoose.Types.ObjectId[];
  payments: mongoose.Types.ObjectId[];
  reviews: mongoose.Types.ObjectId[];
  avgRating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CertificationType {
  name: string;
  content: string;
  photoUrl: string;
  publicId?: String;
}

interface TransformationClientType {
  name: string;
  content: string;
  photoUrl: string;
  publicId?: String;
}

//  Trainer schema with the above intefaces

const trainerSchema = new Schema<TrainerType>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    mobileNumber: { type: Number, default: 0 },
    age: { type: Number, default: 0 },
    role: { type: String, default: "trainer" },
    isBlocked: { type: Boolean, default: false },
    profilePicture: String,
    publicId: String,
    experience: { type: Number, default: 0 },
    specializedIn: String,
    price: { type: Number, default: 0 },
    description: String,
    clients: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    certifications: {
      type: [
        {
          name: String,
          content: String,
          photoUrl: String,
          publicId: String,
        },
      ],
      default: [],
    },

    transformationClients: {
      type: [
        {
          name: String,
          content: String,
          photoUrl: String,
          publicId: String,
        },
      ],
      default: [],
    },

    reviews: [{ type: mongoose.Types.ObjectId, ref: "Review", default: [] }],
    avgRating: { type: Number, default: 0 },

    payments: { type: [mongoose.Types.ObjectId], ref: "TrainerPayment" },
  },
  { timestamps: true }
);

export const Trainer = mongoose.model("Trainer", trainerSchema);
