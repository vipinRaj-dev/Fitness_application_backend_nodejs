import { OTP } from "../models/OtpModel";

import { OTPType } from "../models/OtpModel"


export async function otpVerify( otp: number) {
  let otpDoc : OTPType = await OTP.findOne({otp: otp});
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
