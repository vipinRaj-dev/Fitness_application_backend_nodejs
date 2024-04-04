"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveOTPAndTempUser = void 0;
const OtpModel_1 = require("../models/OtpModel");
const nodemailer_1 = __importDefault(require("nodemailer"));
const password_1 = require("./password");
function SaveOTPAndTempUser(_a) {
    return __awaiter(this, arguments, void 0, function* ({ email, password, name, }) {
        //generate otp
        const Otp = Math.floor(1000 + Math.random() * 9000);
        const hashedPasswordGenerated = yield (0, password_1.hashPassword)(password);
        //save the otpwith user details in the temp collection
        const newOTP = new OtpModel_1.OTP({
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
        const transporter = nodemailer_1.default.createTransport({
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
            const info = yield transporter.sendMail(mailOptions);
            if (info.response) {
                console.log("Email sent: " + info.response);
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.error("Error sending email: " + error);
        }
    });
}
exports.SaveOTPAndTempUser = SaveOTPAndTempUser;
