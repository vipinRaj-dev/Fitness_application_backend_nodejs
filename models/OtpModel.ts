import mongoose, { Document, Schema } from 'mongoose';

export interface OTPType extends Document {
  _id?: string;
  number: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const otpSchema = new Schema<OTPType>(
  {
    number: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '60s' } },
  },
  { timestamps: true }
);

export const OTP = mongoose.model<OTPType>('OTP', otpSchema);