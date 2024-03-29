import express from "express";

import jwt from "jsonwebtoken";

import { hashPassword, verifyPassword } from "../utils/password";

import { User, UserType } from "../models/UserModel";
import { Trainer, TrainerType } from "../models/TrainerModel";
import { Admin, AdminType } from "../models/AdminModel";

import { otpVerify } from "../utils/otpverify";
import { SaveOTPAndTempUser } from "../utils/sendandsaveotp";

export const userRegistrationSendOtp = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // console.log("Request body:", req.body);

    const { name, email, password } = req.body;

    console.log("Request body:", name, email, password);

    let user: UserType | TrainerType | AdminType;

    user = await User.findOne({ email: email });

    if (!user) {
      user = await Trainer.findOne({ email: email });
    }
    if (!user) {
      user = await Admin.findOne({ email: email });
    }

    if (user) {
      // console.log("working");
      return res.status(409).json({ msg: "user already exists" });
    }

    //send the otp
    const otpSend = await SaveOTPAndTempUser({ email, name, password });

    //also save the user details in the temp collection

    if (otpSend) {
      res.status(200).json({ msg: "otp sent successfully" });
    } else {
      console.error("Error sending otp");
      throw new Error("Error sending otp");
    }
  } catch (error) {
    res.status(500).json({ msg: "server error" });
  }
};

export const SaveUser = async (req: express.Request, res: express.Response) => {
  try {
    let { otp, data } = req.body;
    // console.log("Request body:", req.body);
    let OTP = parseInt(otp);
    console.log("otp:", OTP);
    let otpDoc = await otpVerify(OTP, data.email);

    if (!otpDoc) {
      return res.status(401).json({ msg: "otp verification failed" });
    } else {
      // console.log("otp verified successfully");
      let { name, email, hashedPassword } = otpDoc;
      let userCount = await User.countDocuments({});

      let trialPeriod = 5; // 5 days trial period
      const trialEndsDate = new Date();
      trialEndsDate.setDate(trialEndsDate.getDate() + trialPeriod);

      //register the user
      let newUser = new User({
        admissionNumber: userCount + 1,
        name,
        email,
        password: hashedPassword,
        trialEndsAt: trialEndsDate,
      });
      newUser
        .save()
        .then((user: UserType) => {
          // console.log("User saved successfully:", user);
          return res.status(201).json({ msg: "user registration successful" });
        })
        .catch((error: any) => {
          console.error("Error saving user:", error);
        });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const userLogin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, password } = req.body;
    // console.log("Request body:", email, password);

    let foundUser: UserType | TrainerType | AdminType;

    foundUser = await User.findOne({ email: email });

    if (!foundUser) {
      foundUser = await Trainer.findOne({ email: email });
    }
    if (!foundUser) {
      foundUser = await Admin.findOne({ email: email });
    }

    if (!foundUser) {
      return res.status(404).json({ msg: "user not found" });
    }

    let passwordMatch = await verifyPassword(password, foundUser.password);

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
    // sending token

    let payload = {
      email: email,
      role: foundUser.role,
      userId: foundUser._id,
    };

    let token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    res
      .status(200)
      .cookie("jwttoken", token)
      .json({ success: "success", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const checkrole = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];

    if (requstedUser.role === "user") {
      let isUserBlocked = await User.findById(requstedUser.userId).select(
        "userBlocked"
      );
      if (!isUserBlocked) {
        return res.status(404).json({ msg: "user not found" });
      }
      // console.log("requstedUser", requstedUser);
      console.log("isUserBlocked", isUserBlocked);
      console.log(requstedUser.userId)

      if (isUserBlocked.userBlocked) {
        return res
          .status(401)
          .json({ msg: "user is blocked please contact to admin" });
      }
    }

    res
      .status(200)
      .json({ role: requstedUser.role, email: requstedUser.email , userId : requstedUser.userId });
  } catch (error) {
    console.error(error);
  }
};

export const forgotPasswordOtpSend = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);
    const userDetails = await User.findOne({ email: email });
    if (!userDetails) {
      return res.status(404).json({ msg: "User not found" });
    }

    const otpSend = await SaveOTPAndTempUser({ email, password });
    if (otpSend) {
      return res.status(200).json({ msg: "otp sent successfully" });
    } else {
      console.error("Error sending otp");
    }
  } catch (error) {
    console.error(error);
  }
};

export const otpVerification = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { otp } = req.body;

    const otpDoc = await otpVerify(Number(otp));

    if (otpDoc) {
      const { email, hashedPassword } = otpDoc;
      const userDetails = await User.findOne({ email: email });
      if (!userDetails) {
        return res.status(404).json({ msg: "User not found" });
      } else {
        userDetails.password = hashedPassword;
        userDetails.save().then((user: any) => {
          return res.status(200).json({ msg: "Password reset successfully" });
        });
      }
    } else {
      return res.status(401).json({ msg: "otp verification failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
};

// export const forgotPasswordReset = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const { email, password } = req.body;
//     const userDetails = await User.findOne({ email: email });
//     let hashedPassword = await hashPassword(password);
//     if (!userDetails) {
//       return res.status(404).json({ msg: "User not found" });
//     } else {
//       userDetails.password = hashedPassword;
//       userDetails.save().then((user: any) => {
//         // console.log("Password reset successfully:", user);
//         return res.status(200).json({ msg: "Password reset successfully" });
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({msg : "server error"})
//   }
// };
