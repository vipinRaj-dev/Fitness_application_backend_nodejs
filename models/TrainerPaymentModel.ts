import mongoose, { Schema, Document } from "mongoose";

export interface TrainerPaymentType extends Document {
  _id?: string;
  planSelected: string 
  transactionId: string;
  clientDetails: mongoose.Types.ObjectId;
  trainersId: mongoose.Types.ObjectId;
  amount: number;
    
}

export const TrainerPaymentSchema: Schema<TrainerPaymentType> = new Schema(
  {
    planSelected: String,
    transactionId: String,
    clientDetails: {type : Schema.Types.ObjectId , ref : 'User'},
    trainersId: {type : Schema.Types.ObjectId , ref : 'Trainer'},
    amount: Number,
  },
  { timestamps: true }
);

export const TrainerPayment = mongoose.model(
  "TrainerPayment",
  TrainerPaymentSchema
);
