import mongoose, { Schema, Document } from "mongoose";

export interface AdminPaymentType extends Document {
  _id?: string;
  planSelected: string;
  transactionId: string;
  clientDetails: mongoose.Types.ObjectId;
  amount: number;
  receiptUrl: string;
}

export const AdminPaymentSchema: Schema<AdminPaymentType> = new Schema( 
  {
    planSelected: String,
    transactionId: String,
    clientDetails: {type : Schema.Types.ObjectId , ref : 'User'},
    amount: Number,
    receiptUrl: String,
  },
  { timestamps: true }
);

export const AdminPayment = mongoose.model("AdminPayment", AdminPaymentSchema);
