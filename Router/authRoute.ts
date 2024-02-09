import express from "express";


import {
  SaveUser,
  checkrole,
  forgotPasswordOtpSend,
  forgotPasswordReset,
  otpVerification,
  userLogin,
  userRegistrationSendOtp,
} from "../controllers/authController";
import { tokenVerify } from "../middleware/tokenVerify";

const authRouter: express.Router = express.Router();

authRouter.post("/sendOtp", userRegistrationSendOtp);

authRouter.post('/verifyOtp', otpVerification)

authRouter.post('/registerUser', SaveUser)

authRouter.post("/login", userLogin);

authRouter.get("/role" ,tokenVerify, checkrole)

authRouter.post('/forgot-password', forgotPasswordOtpSend)

authRouter.post('/reset-password' , forgotPasswordReset)

export default authRouter;
