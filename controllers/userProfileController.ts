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
  console.log("userHomePage");

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

    console.log("userData", userData);
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
    const { time, foodDocId } = req.body;

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
  console.log("userDate", userDate);
  // console.log("id", id);
  // const startOfUserDate = new Date(
  //   userDate.getUTCFullYear(),
  //   userDate.getUTCMonth(),
  //   userDate.getUTCDate()
  // );
  // const startOfNextDate = new Date(
  //   userDate.getUTCFullYear(),
  //   userDate.getUTCMonth(),
  //   userDate.getUTCDate() + 1
  // );

  // const startOfUserDate = userDate.setHours(0, 0, 0, 0);
  // const endOfTheDay = userDate.setHours(23, 59, 59, 999);

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
  }).populate({
    path: "foodLogs",
    populate: {
      path: "foodId",
    },
  });

  console.log("attandanceData", attandanceData);
  res.status(200).json({ msg: "attandanceData", attandanceData });
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
