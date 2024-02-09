import mongoose, { Document, Schema } from "mongoose";

export interface TrainerType extends Document {
  _id?: string;
  password: string;
  email: string;
  name: string;
  age?: number;
  role: string;
  trainerBlocked: boolean;
  profilePicture: string;
  experience: number;
  specializedIn: string;
  price: number;
  description: string;
  certifications: CertificationType[];
  transformationClients: TransformationClientType[];
  clients: mongoose.Types.ObjectId[];
  reviews: ReviewType[];
  payments: PaymentType[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface CertificationType {
  name: string;
  content: string;
  photoUrl: string;
}

interface TransformationClientType {
  name: string;
  content: string;
  photoUrl: string;
}

interface ReviewType {
  clientName: string;
  content: string;
  rating: number;
}

interface PaymentType {
  clientName: string;
  amount: number;
  date: Date;
}

//  Trainer schema with the above intefaces

const trainerSchema = new Schema<TrainerType>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, default: 0 },
    role: { type: String, default: "trainer" },
    trainerBlocked: { type: Boolean, default: false },
    profilePicture: String,
    experience: { type: Number, default: 0 },
    specializedIn: String,
    price: { type: Number, default: 0 },
    description: String,
    certifications: {
        type: [{
          name: String,
          content: String,
          photoUrl: String,
        }],
        default: [],
      },
      
      transformationClients: {
        type: [{
          name: String,
          content: String,
          photoUrl: String,
        }],
        default: [],
      },
      
      reviews: {
        type: [{
          clientName: String,
          content: String,
          rating: Number,
        }],
        default: [],
      },
      
      payments: {
        type: [{
          clientName: String,
          amount: Number,
          date: Date,
        }],
        default: [],
      },
  },    
  { timestamps: true }
);

export const Trainer = mongoose.model("Trainer", trainerSchema);