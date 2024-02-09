import { OTP } from "../models/OtpModel";


export async function otpVerify(email: string, otp: number) {
  let otpDoc = await OTP.findOne({ email: email });
  if (!otpDoc) {
    return false;
  }
  if (otpDoc.otp !== otp) {
    return false;
  }
  if (otpDoc.otp === otp) {
    return true;
  }
}
