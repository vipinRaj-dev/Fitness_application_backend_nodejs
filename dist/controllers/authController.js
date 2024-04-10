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
exports.otpVerification = exports.forgotPasswordOtpSend = exports.checkrole = exports.userLogin = exports.SaveUser = exports.userRegistrationSendOtp = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const password_1 = require("../utils/password");
const UserModel_1 = require("../models/UserModel");
const TrainerModel_1 = require("../models/TrainerModel");
const AdminModel_1 = require("../models/AdminModel");
const otpVerify_1 = require("../utils/otpVerify");
const sendAndSaveOtp_1 = require("../utils/sendAndSaveOtp");
const AttendanceModel_1 = require("../models/AttendanceModel");
const userRegistrationSendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("Request body:", req.body);
        const { name, email, password } = req.body;
        // console.log("Request body:", name, email, password);
        let user;
        user = yield UserModel_1.User.findOne({ email: email });
        if (!user) {
            user = yield TrainerModel_1.Trainer.findOne({ email: email });
        }
        if (!user) {
            user = yield AdminModel_1.Admin.findOne({ email: email });
        }
        if (user) {
            // console.log("working");
            return res.status(409).json({ msg: "user already exists" });
        }
        //send the otp
        const otpSend = yield (0, sendAndSaveOtp_1.SaveOTPAndTempUser)({ email, name, password });
        //also save the user details in the temp collection
        if (otpSend) {
            res.status(200).json({ msg: "otp sent successfully" });
        }
        else {
            console.error("Error sending otp");
            throw new Error("Error sending otp");
        }
    }
    catch (error) {
        res.status(500).json({ msg: "server error" });
    }
});
exports.userRegistrationSendOtp = userRegistrationSendOtp;
const SaveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, data } = req.body;
        // console.log("Request body:", req.body);
        const OTP = parseInt(otp);
        console.log("otp:", OTP);
        const otpDoc = yield (0, otpVerify_1.otpVerify)(OTP, data.email);
        if (!otpDoc) {
            return res.status(401).json({ msg: "otp verification failed" });
        }
        else {
            // console.log("otp verified successfully");
            const { name, email, hashedPassword } = otpDoc;
            const userCount = yield UserModel_1.User.countDocuments({});
            const trialPeriod = 5; // 5 days trial period
            const trialEndsDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            trialEndsDate.setDate(trialEndsDate.getDate() + trialPeriod);
            //register the user
            const newUser = new UserModel_1.User({
                admissionNumber: userCount + 1,
                name,
                email,
                password: hashedPassword,
                trialEndsAt: trialEndsDate,
            });
            newUser
                .save()
                .then((user) => {
                // console.log("User saved successfully:", user);
                return res.status(201).json({ msg: "user registration successful" });
            })
                .catch((error) => {
                console.error("Error saving user:", error);
            });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.SaveUser = SaveUser;
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // console.log("Request body:", email, password);
        let foundUser;
        foundUser = yield UserModel_1.User.findOne({ email: email });
        if (!foundUser) {
            foundUser = yield TrainerModel_1.Trainer.findOne({ email: email });
        }
        if (!foundUser) {
            foundUser = yield AdminModel_1.Admin.findOne({ email: email });
        }
        if (!foundUser) {
            return res.status(404).json({ msg: "user not found" });
        }
        const passwordMatch = yield (0, password_1.verifyPassword)(password, foundUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ msg: "password incorrect" });
        }
        //check if the user is blocked
        if ("userBlocked" in foundUser && foundUser.userBlocked) {
            return res
                .status(401)
                .json({ msg: "You are blocked please contact to admin" });
        }
        if ("isBlocked" in foundUser && foundUser.isBlocked) {
            return res
                .status(401)
                .json({ msg: "You are blocked please contact to admin" });
        }
        //if there is no attandance make an attandance
        if (foundUser.role === "user" && !foundUser.attendanceId) {
            const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            today.setHours(0, 0, 0, 0);
            const attendance = new AttendanceModel_1.Attendance({
                date: today,
                userId: foundUser._id,
                isPresent: false,
                foodLogs: [],
            });
            const ans = yield attendance.save();
            const userUpdation = yield UserModel_1.User.updateOne({ _id: foundUser._id }, { $set: { attendanceId: ans._id } });
            // console.log("attandance created for new user", userUpdation);
        }
        // sending token
        const payload = {
            email: email,
            role: foundUser.role,
            userId: foundUser._id,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_KEY);
        // res
        //   .status(200)
        //   .cookie("jwttoken", token)
        //   .json({ success: "success", token: token });
        res.cookie("jwttoken", token, {
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ success: "success", token: token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.userLogin = userLogin;
const checkrole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        // console.log("role from the backend code", requstedUser);
        // if (requstedUser.role === "user") {
        //   const isUserBlocked = await User.findById(requstedUser.userId).select(
        //     "userBlocked"
        //   );
        //   if (!isUserBlocked) {
        //     return res.status(404).json({ msg: "user not found" });
        //   }
        //   // console.log("requstedUser", requstedUser);
        //   console.log("isUserBlocked", isUserBlocked);
        //   // console.log(requstedUser.userId)
        //   if (isUserBlocked.userBlocked) {
        //     return res
        //       .status(401)
        //       .json({ msg: "user is blocked please contact to admin" });
        //   }
        // }
        res.status(200).json({
            role: requstedUser.role,
            email: requstedUser.email,
            userId: requstedUser.userId,
        });
    }
    catch (error) {
        console.error(error);
    }
});
exports.checkrole = checkrole;
const forgotPasswordOtpSend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // console.log(email, password);
        const userDetails = yield UserModel_1.User.findOne({ email: email });
        if (!userDetails) {
            return res.status(404).json({ msg: "User not found" });
        }
        const otpSend = yield (0, sendAndSaveOtp_1.SaveOTPAndTempUser)({ email, password });
        if (otpSend) {
            return res.status(200).json({ msg: "otp sent successfully" });
        }
        else {
            console.error("Error sending otp");
        }
    }
    catch (error) {
        console.error(error);
    }
});
exports.forgotPasswordOtpSend = forgotPasswordOtpSend;
const otpVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        const otpDoc = yield (0, otpVerify_1.otpVerify)(Number(otp));
        if (otpDoc) {
            const { email, hashedPassword } = otpDoc;
            const userDetails = yield UserModel_1.User.findOne({ email: email });
            if (!userDetails) {
                return res.status(404).json({ msg: "User not found" });
            }
            else {
                userDetails.password = hashedPassword;
                userDetails.save().then((user) => {
                    return res.status(200).json({ msg: "Password reset successfully" });
                });
            }
        }
        else {
            return res.status(401).json({ msg: "otp verification failed" });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "server error" });
    }
});
exports.otpVerification = otpVerification;
