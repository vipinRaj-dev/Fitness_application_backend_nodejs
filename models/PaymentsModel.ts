import mongoose, { Schema, Document } from "mongoose";

export interface PaymentType extends Document {
  _id?: string;
  transactionId: number;
  clientName: string;
  clientDetails: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
}

export const PaymentSchema: Schema<PaymentType> = new Schema({
  _id: String,
  transactionId: Number,
  clientName: String,
  clientDetails: mongoose.Types.ObjectId,
  amount: Number,
  date: Date,
});

export const Payment = mongoose.model("Payment", PaymentSchema);
