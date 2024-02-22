import mongoose, { Schema, Document } from "mongoose";

export interface TrainerPaymentType extends Document {
  _id?: string;
  planSelected: "monthly" | "6months" | "yearly";
  transactionId: number;
  clientName: string;
  clientDetails: mongoose.Types.ObjectId;
  trainersId: mongoose.Types.ObjectId;
  trainersName: string;
  amount: number;
  invoice : string;
  
}

export const TrainerPaymentSchema: Schema<TrainerPaymentType> = new Schema(
  {
    _id: String,
    planSelected: String,
    transactionId: Number,
    clientName: String,
    clientDetails: mongoose.Types.ObjectId,
    trainersId: mongoose.Types.ObjectId,
    trainersName: String,
    amount: Number,
    invoice : String,
  },
  { timestamps: true }
);

export const TrainerPayment = mongoose.model(
  "TrainerPayment",
  TrainerPaymentSchema
);
