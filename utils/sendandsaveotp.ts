
import { OTP } from "../models/OtpModel";

import nodemailer from "nodemailer";


export async function sendAndSaveOTP(email: string) {
    //generate otp
    const Otp = Math.floor(1000 + Math.random() * 9000);
  
    //save the otp
    let newOTP = new OTP({
      email: email,
      otp: Otp,
    });
  
    newOTP
      .save()
      .then((otp: any) => {
        console.log("OTP saved successfully:", otp);
      })
      .catch((error: any) => {
        console.error("Error saving OTP:", error);
      });
  
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vipinrj8473@gmail.com",
        pass: "vqbh mqbd pobd svkj",
      },
    });
  
    let mailOptions = {
      from: "vipinrj8473@gmail.com",
      to: email,
      subject: "Your OTP",
      text: `Your OTP is ${Otp}`,
    };
  
    try {
      let info = await transporter.sendMail(mailOptions);
      console.log("Email sent: " + info.response);
      return true;
    } catch (error) {
      console.error("Error sending email: " + error);
    }
  }
  