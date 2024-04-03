import { OTP } from "../models/OtpModel";

import { OTPType } from "../models/OtpModel";

export async function otpVerify(otp: number, email?: string) {
  const query: { otp: number; email?: string } = { otp: otp };
  if (email) {
    query.email = email;
  }
  // console.log("Query:", query); 
  const otpDoc: OTPType = await OTP.findOne(query);
  if (!otpDoc) {
    return false;
  }
  if (otpDoc.otp !== otp) {
    return false;
  }
  if (otpDoc.otp === otp) {
    return otpDoc;
  }
}
