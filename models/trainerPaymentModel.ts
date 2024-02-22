import mongoose, { Schema, Document } from "mongoose";

export interface TrainerPaymentType extends Document {
  _id?: string;
  planSelected: string
  transactionId: string;
  clientDetails: mongoose.Types.ObjectId;
  trainersId: mongoose.Types.ObjectId;
  amount: number;
  receiptUrl: String,
    
}

export const TrainerPaymentSchema: Schema<TrainerPaymentType> = new Schema(
  {
    planSelected: String,
    transactionId: String,
    clientDetails: mongoose.Types.ObjectId,
    trainersId: mongoose.Types.ObjectId,
    amount: Number,
    receiptUrl: String,
  },
  { timestamps: true }
);

export const TrainerPayment = mongoose.model(
  "TrainerPayment",
  TrainerPaymentSchema
);
