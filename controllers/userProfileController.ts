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

  let requstedUser: any = req.headers["user"];

  let userData: UserType | null = await User.findById(
    requstedUser.userId
  ).populate("latestFoodByTrainer.foodId");

  // console.log("userData", userData.latestFoodByTrainer);

  res
    .status(200)
    .json({ msg: "userHomePage", latestDiet: userData.latestFoodByTrainer });
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
      "_id name email mobileNumber weight height userBlocked profileImage publicId healthIssues"
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
    const requstedUser: any = req.headers["user"];
    const { foodId, time, timePeriod, quantity ,status } = req.body;
    const userId = requstedUser.userId;

    // console.log('api fetched after the time up' ,foodId ,  time , timePeriod , quantity , status)
    
    const foodLog = new FoodLog({
      date: new Date(),
      userId,
      foodId,
      status: status, 
      time,  
      timePeriod,
      quantity,
    });

    const foodLogData = await foodLog.save();

    const userData = await User.findById(userId).populate("attendanceId");

    if (!userData) {
      console.log("no attendance found");
    } else {
      // console.log("attendanceUpdate", userData.attendanceId);
      await Attendance.findByIdAndUpdate(
        userData.attendanceId._id,
        { $push: { foodLogs: foodLogData._id } },
        { new: true }
      );

      res.status(200).json({ msg: "food log added successfully" });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getFoodLog = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    interface PopulatedUser extends Document {
      _id: string;
      attendanceId: {
        _id: string;
        foodLogs: any[];
      };
    }
    const requstedUser: any = req.headers["user"];
    const userId = requstedUser.userId;

    const addedFoodLog = (await User.findById(userId).populate({
      path: "attendanceId",
      populate: {
        path: "foodLogs",
      },
    })) as PopulatedUser;
    // console.log("addedFoodLog", addedFoodLog);

    const arrayOfFoods = addedFoodLog?.attendanceId?.foodLogs?.map((log) => {
      return log.foodId;
    });

    // console.log("arrayOfFoods", arrayOfFoods);
    res.status(200).json({ msg: "food logs", arrayOfFoods });
  } catch (error) {
    console.error(error);
  }
};

export const getDay = async (req: express.Request, res: express.Response) => {
  const userDate = new Date(req.params.date); // assuming date is passed as a parameter in the request
  const startOfUserDate = new Date(
    userDate.getUTCFullYear(),
    userDate.getUTCMonth(),
    userDate.getUTCDate()
  );
  const startOfNextDate = new Date(
    userDate.getUTCFullYear(),
    userDate.getUTCMonth(),
    userDate.getUTCDate() + 1
  );

  console.log("date", startOfUserDate);

  const attandanceData = await Attendance.find({
    date: {
      $gte: startOfUserDate,
      $lt: startOfNextDate,
    },
  });

  console.log("attandanceData", attandanceData);
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
 