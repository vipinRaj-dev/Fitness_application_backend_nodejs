"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const tokenVerify_1 = require("../middleware/tokenVerify");
const authRouter = express_1.default.Router();
authRouter.post("/sendOtp", authController_1.userRegistrationSendOtp);
authRouter.post('/registerUser', authController_1.SaveUser);
authRouter.post("/login", authController_1.userLogin);
authRouter.get("/role", tokenVerify_1.tokenVerify, authController_1.checkrole);
authRouter.post('/forgot-password', authController_1.forgotPasswordOtpSend);
authRouter.post('/verifyOtp', authController_1.otpVerification);
// authRouter.post('/reset-password' , forgotPasswordReset)
exports.default = authRouter;
