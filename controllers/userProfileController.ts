import express from "express";

import { UserType, User } from "../models/UserModel";
import { AttendanceType, Attendance } from "../models/AttendanceModel";
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from "../imageUploadConfig/cloudinary";
import { WorkoutLog, WorkoutLogType } from "../models/WorkoutLogModel";
import { FoodLog } from "../models/FoodLogModel";

export const userProfile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];

    // console.log(requstedUser);

    let userData: UserType | null = await User.findById(
      requstedUser.userId
    ).select(
      "_id name email mobileNumber weight height userBlocked profileImage publicId"
    );

    if (!userData) {
      return res.status(400).json({
        msg: "no user data",
      });
    }
    // console.log(userData);

    res.status(200).json({ msg: "user details", user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};
export const userProfileImageUpdate = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];
    const id = requstedUser.userId;
    let imageData;
    if (req.file) {
      const user = await User.findById(id);

      if (user?.publicId) {
        let publicId = user.publicId;
        await removeFromCloudinary(publicId);
        await User.updateOne(
          { _id: id },
          { $unset: { profileImage: "", publicId: "" } }
        );
      } else {
        console.log("no public id found");
      }
      // console.log(req.file);

      try {
        imageData = await uploadToCloudinary(req.file.path, "user-Images");
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res.status(500).json({ msg: "Error uploading image", error });
      }

      if (!imageData || !imageData.url || !imageData.public_id) {
        console.error("Invalid response from Cloudinary:", imageData);
        return res
          .status(500)
          .json({ msg: "Invalid response from image upload" });
      }

      const profileUpdate = await User.updateOne(
        { _id: id },
        { $set: { profileImage: imageData.url, publicId: imageData.public_id } }
      );
      console.log("profileUpdate", profileUpdate);
    }
    // console.log("req.body user : " , req.body);
    // user detal update
    const updateData = req.body;
    delete updateData.profileImage;
    delete updateData.publicId;
    // console.log("updateData", updateData);

    try {
      const existingUser = await User.findOne({ email: updateData.email });

      if (existingUser && String(existingUser._id) !== id) {
        return res.status(400).json({ msg: "Email already in use" });
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      console.log("updatedUser", updatedUser);
    } catch (error) {
      console.log("error", error.message, error.stack);
    }

    res.status(200).json({ msg: "updated successfully" , imageData });
  } catch (error) {
    res.status(500).json({ msg: "server error", error });
    console.log("error", error.message, error.stack);
  }
};

export const attendance = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let workoutlogsData = await WorkoutLog.find({});
    let workoutlogsIds = workoutlogsData.map((log) => log._id);

    let foodLogsData = await FoodLog.find({});
    let foodLogsIds = foodLogsData.map((log) => log._id);

    let attandanceAdd = await Attendance.findByIdAndUpdate(
      "65d0218ab836966a19492a46",
      {
        $push: {
          workOutLogs: { $each: workoutlogsIds },
          foodLogs: { $each: foodLogsIds },
        },
      },
      { new: true }
    );

    let attendanceData = await Attendance.findById(
      "65d0218ab836966a19492a46"
    ).populate("workOutLogs foodLogs");
    // console.log("attendanceData", attendanceData);

    let workoutloguser = await WorkoutLog.findById(
      "65d161f831fa069aa7e1d541"
    ).populate("userId");
    // console.log("workoutloguser", workoutloguser);
  } catch (error) {
    console.error(error);
  }
};
