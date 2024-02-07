import mongoose, { Schema, Document } from "mongoose";

export interface EnquiryType extends Document {
  _id?: string;
  name: string;
  gender: string;
  age: number;
  email: string;
  mobNumber: number;
}

export const EnquirySchema: Schema<EnquiryType> = new Schema({
  _id: String,
  name: String,
  gender: String,
  age: Number,
  email: String,
  mobNumber: Number,
});
export const Enquiry = mongoose.model("Enquiry", EnquirySchema);
