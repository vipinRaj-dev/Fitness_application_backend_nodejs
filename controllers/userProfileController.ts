import express from "express";

import { UserType, User } from "../models/UserModel";
import { AttendanceType, Attendance } from "../models/AttendanceModel";
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from "../imageUploadConfig/cloudinary";
import { WorkoutLog, WorkoutLogType } from "../models/WorkoutLogModel";
import { FoodLog } from "../models/FoodLogModel";

export const userHomePage = async (
  req: express.Request,
  res: express.Response
) => {
  type dietFoodType = {
    _id: string;
    trainerId: string;
    trainerPaymentDueDate: Date;
    attendanceId: {
      _id: string;
      foodLogs: any[];
    };
  };

  let requstedUser: any = req.headers["user"];

  let userDetails: dietFoodType = await User.findById(
    requstedUser.userId
  ).populate({
    path: "attendanceId",
    populate: {
      path: "foodLogs",
      populate: {
        path: "foodId",
      },
    },
  });

  const hasTrainer = userDetails?.trainerId
    ? userDetails.trainerPaymentDueDate > new Date()
      ? true
      : false
    : false;

  const eatedFoodDocIds = userDetails.attendanceId?.foodLogs
    .filter((food) => food.status === true)
    .map((food) => food._id);

  // console.log("userDetails", userDetails.attendanceId.foodLogs);
  // console.log("eatedFood", eatedFoodDocIds);

  res.status(200).json({
    msg: "userHomePage",
    dietFood: userDetails?.attendanceId?.foodLogs,
    addedFoodDocIds: eatedFoodDocIds,
    hasTrainer,
    attendanceDocId: userDetails?.attendanceId?._id,
  });
};

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
      "_id name email mobileNumber weight height userBlocked profileImage publicId healthIssues createdAt"
    );

    // console.log("userData", userData);
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

    const healthIssues = {
      BloodPressure: updateData.BloodPressure,
      Diabetes: updateData.Diabetes,
      cholesterol: updateData.cholesterol,
      HeartDisease: updateData.HeartDisease,
      KidneyDisease: updateData.KidneyDisease,
      LiverDisease: updateData.LiverDisease,
      Thyroid: updateData.Thyroid,
      Others: updateData.Others,
    };

    try {
      const existingUser = await User.findOne({ email: updateData.email });

      if (existingUser && String(existingUser._id) !== id) {
        return res.status(400).json({ msg: "Email already in use" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          name: updateData.name,
          email: updateData.email,
          mobileNumber: updateData.mobileNumber,
          weight: updateData.weight,
          height: updateData.height,
          healthIssues: healthIssues,
          userBlocked: updateData.userBlocked,
        },
        { new: true }
      );

      // console.log("updatedUser", updatedUser);
    } catch (error) {
      console.log("error", error.message, error.stack);
    }

    res.status(200).json({ msg: "updated successfully", imageData });
  } catch (error) {
    res.status(500).json({ msg: "server error", error });
    console.log("error", error.message, error.stack);
  }
};

export const addFoodLog = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { time, foodDocId, attendanceId } = req.body;

    console.log("attendanceId", attendanceId);

    const currentTime = new Date();
    const foodTime = new Date();

    const [hours, minutes] = time.split(":").map(Number);
    foodTime.setHours(hours, minutes);

    const foodTime1HoursBefore = new Date(foodTime.getTime() - 1000 * 60 * 60);

    if (foodTime1HoursBefore > currentTime) {
      return res.status(201).json({ msg: "time not reached yet" });
    }

    const foodLogData = await FoodLog.findById(foodDocId);

    if (foodTime > currentTime) {
      if (foodLogData) {
        // console.log("foodLogData", foodLogData);
        foodLogData.status = true;
        await foodLogData.save();
        await Attendance.findByIdAndUpdate(attendanceId, { isPresent: true });

        res.status(200).json({ msg: "food log added successfully" });
      }
    } else {
      console.log("time passed");
      res.status(400).json({ msg: "time passed" });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getDay = async (req: express.Request, res: express.Response) => {
  let requstedUser: any = req.headers["user"];
  const id = requstedUser.userId;
  const userDate = new Date(req.params.date); // assuming date is passed as a parameter in the request
  // console.log("userDate", userDate);

  const startOfUserDate = new Date(userDate.setHours(0, 0, 0, 0));
  const endOfTheDay = new Date(userDate.setHours(23, 59, 59, 999));

  console.log("startOfUserDate", startOfUserDate);
  console.log("endOfTheDay", endOfTheDay);

  const attandanceData = await Attendance.findOne({
    userId: id,
    date: {
      $gte: startOfUserDate,
      $lt: endOfTheDay,
    },
  })
    .populate({
      path: "foodLogs",
      populate: {
        path: "foodId",
      },
    })
    .populate({
      path: "workOutLogs",
      populate: {
        path: "workOuts.workoutId",
      },
    });

  // console.log("attandanceData", attandanceData);  
  res.status(200).json({ msg: "attandanceData", attandanceData });
};

