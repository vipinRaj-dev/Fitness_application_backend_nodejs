import mongoose, { Document, Schema } from "mongoose";

import { EnquirySchema, EnquiryType } from "./EnquiryModel";
import { AdminPayment, AdminPaymentType } from "./PaymentsModel";

interface PlanDetailType {
  _id?: string;
  title: string;
  price: number;
  description: string;
  features: string[];
  imgUrl: string;
}

 export interface AdminType extends Document {
  _id?: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  enquiries?: [EnquiryType];
  paymentDetails?: [AdminPaymentType];
  planDetails?: [PlanDetailType];
  createdAt?: Date;
  updatedAt?: Date;
}

// schema design
const adminSchema = new Schema<AdminType>(
  {
    fullName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    enquiries: [
      {
        type: Schema.Types.ObjectId,
        ref: EnquirySchema,
      },
    ],
    paymentDetails: [
      {
        type: Schema.Types.ObjectId,
        ref: AdminPayment,
      },
    ],
    planDetails: {
      type: [
        {
          title: { type: String },
          price: { type: Number },
          description: { type: String },
          features: [{ type: String }],
          imgUrl: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);
export const Admin = mongoose.model("Admin", adminSchema);
