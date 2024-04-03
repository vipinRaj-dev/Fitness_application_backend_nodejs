import { OTP } from "../models/OtpModel";

import nodemailer from "nodemailer";
import { hashPassword } from "./password";

export async function SaveOTPAndTempUser({
  email,
  password,
  name,
}: {
  email: string; 
  name?: string;
  password?: string; 
}) {
  //generate otp
  const Otp = Math.floor(1000 + Math.random() * 9000);

  const hashedPasswordGenerated = await hashPassword(password);
  //save the otpwith user details in the temp collection
  const newOTP = new OTP({
    email: email,
    otp: Otp,
    name: name || "",
    hashedPassword: hashedPasswordGenerated || "",
  });

  newOTP
    .save()
    .then((otp) => {
      console.log("OTP saved successfully:", otp.otp);
    })
    .catch((error) => {
      console.error("Error saving OTP:", error);
    });

    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vipinrj8473@gmail.com",
      pass: "vqbh mqbd pobd svkj",
    },
  });

  const mailOptions = {
    from: "vipinrj8473@gmail.com",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${Otp}`,
    html: `
    <div style="background-color: #f6f6f6; padding: 20px;">
      <h1 style="color: #444; text-align: center;">Welcome</h1>
    
      <p style="font-size: 16px; color: #666; text-align: center;">
        Thank you for using our service. Here is your OTP:
      </p>
      <h2 style="text-align: center; color: #f60;">${Otp}</h2>
      <p style="font-size: 16px; color: #666; text-align: center;">
        Please enter this OTP to continue.
      </p>
    </div>
  `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (info.response) {
      console.log("Email sent: " + info.response);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error sending email: " + error);
  }
}
