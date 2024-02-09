import mongoose, { Document, Schema } from 'mongoose';

export interface OTPType extends Document {
  email: string;
  otp: number;
  name?: string;
  hashedPassword?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const otpSchema = new Schema<OTPType>(
  {
    name: { type: String },
    hashedPassword: { type: String },
    email: { type: String, required: true },
    otp: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '60s' } },
  },
  { timestamps: true }
);

export const OTP = mongoose.model<OTPType>('OTP', otpSchema);