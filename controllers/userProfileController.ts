import express from "express";

import { UserType, User } from "../models/UserModel";
import { AttendanceType, Attendance } from "../models/AttendanceModel";
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from "../imageUploadConfig/cloudinary";
import { FoodLog } from "../models/FoodLogModel";
import { Review } from "../models/ReviewModel";
import { Trainer } from "../models/TrainerModel";
import mongoose from "mongoose";
import { Chat } from "../models/ChatModel";
import moment from 'moment-timezone';
type dietFoodType = {
  _id: string;
  trainerId: string;
  trainerPaymentDueDate: Date;
  attendanceId: {
    _id: string;
    foodLogs: any[];
  };
};

export const userHomePage = async (
  req: express.Request,
  res: express.Response
) => {
  const requstedUser: string | string[] | any = req.headers["user"];

  const userDetails: dietFoodType = await User.findById(
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
    ? userDetails.trainerPaymentDueDate >
      new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      ? true
      : false
    : false;

  const eatedFoodDocIds = userDetails.attendanceId?.foodLogs
    .filter((food) => food.status === true)
    .map((food) => food._id);

  // console.log("userDetails", userDetails.attendanceId.foodLogs);
  // console.log("eatedFood", eatedFoodDocIds);

  //getting the yesterday status

  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime());
  yesterday.setDate(yesterday.getDate() - 1);

  // console.log("today", today);
  // console.log("yesterday", yesterday);

  const yesterdayAttendanceReasonAndId = await Attendance.findOne({
    userId: requstedUser.userId,
    date: yesterday,
  }).select("_id notCompleteReason");

  // console.log("yesterdayAttendanceReasonAndId", yesterdayAttendanceReasonAndId);

  let allTasksCompleted = true;

  if (yesterdayAttendanceReasonAndId?.notCompleteReason === "") {
    const yesterdayAttendance = await Attendance.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(requstedUser.userId),
          date: yesterday,
        },
      },
      {
        $lookup: {
          from: "foodlogs",
          localField: "foodLogs",
          foreignField: "_id",
          as: "foodLogs",
        },
      },
      {
        $lookup: {
          from: "workoutlogs",
          localField: "workOutLogs",
          foreignField: "_id",
          as: "workOutLogs",
        },
      },
      { $unwind: "$workOutLogs" },
      { $unwind: "$workOutLogs.workOuts" },
      { $unwind: "$workOutLogs.workOuts.workoutSet" },
      {
        $group: {
          _id: "$_id",
          allFoodStatusTrue: {
            $first: { $allElementsTrue: "$foodLogs.status" },
          },
          minCompletedReps: {
            $min: "$workOutLogs.workOuts.workoutSet.completedReps",
          },
        },
      },
      {
        $addFields: {
          allWorkoutsCompleted: {
            $gt: ["$minCompletedReps", 0],
          },
        },
      },
    ]);

    if (yesterdayAttendance[0]) {
      allTasksCompleted =
        yesterdayAttendance[0].allFoodStatusTrue &&
        yesterdayAttendance[0].allWorkoutsCompleted;
    } else {
      allTasksCompleted = false;
    }

    // console.log("yesterdayAttendance", yesterdayAttendance);
  }
  res.status(200).json({
    msg: "userHomePage",
    dietFood: userDetails?.attendanceId?.foodLogs,
    addedFoodDocIds: eatedFoodDocIds,
    hasTrainer,
    attendanceDocId: userDetails?.attendanceId?._id,
    allTasksCompleted,
    yesterdayAttendanceId: yesterdayAttendanceReasonAndId?._id,
  });
};

export const getGraphDataUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // console.log("getGraphDataUser");
    // i want the users attandance details aggregated by the 7 days like this

    // how can i aggragate the data to get the above result

    const requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;

    const attendancePerDay = await Attendance.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
          isPresent: true,
        },
      },
      {
        $project: {
          dayOfWeek: {
            $add: [
              { $mod: [{ $subtract: [{ $dayOfWeek: "$date" }, 1] }, 7] },
              1,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$dayOfWeek",
          NoOfDays: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          day: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Mon" },
                { case: { $eq: ["$_id", 2] }, then: "Tue" },
                { case: { $eq: ["$_id", 3] }, then: "Wed" },
                { case: { $eq: ["$_id", 4] }, then: "Thu" },
                { case: { $eq: ["$_id", 5] }, then: "Fri" },
                { case: { $eq: ["$_id", 6] }, then: "Sat" },
                { case: { $eq: ["$_id", 7] }, then: "Sun" },
              ],
              default: "Unknown",
            },
          },
          NoOfDays: 1,
        },
      },
    ]);

    // console.log("attendancePerDay", attendancePerDay);

    const today = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const foodStatusData = await FoodLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
          date: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $group: {
          _id: "$timePeriod",
          totalFood: { $sum: 1 },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", true] }, 1, 0],
            },
          },
        },
      },
    ]);
    // console.log("foodStatusData", foodStatusData);
    res
      .status(200)
      .json({ msg: "attendancePerDay", attendancePerDay, foodStatusData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error", error });
  }
};

export const userProfile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const requstedUser: string | string[] | any = req.headers["user"];

    // console.log(requstedUser);

    const userData: UserType | null = await User.findById(requstedUser.userId)
      .select(
        "_id name email mobileNumber weight height userBlocked profileImage publicId healthIssues createdAt trainerId trainerPaymentDueDate"
      )
      .populate("trainerId", "name profilePicture");

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
    const requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;
    let imageData;
    // console.log('req.file' , req.file)
    if (req.file) {
      const user = await User.findById(id);

      if (user?.publicId) {
        const publicId = user.publicId;
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
        // console.log('image updted successfully ========================' , imageData)
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
      // console.log("profileUpdate", profileUpdate);
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

    res.status(200).json({ msg: "updated successfully", imageData: imageData });
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

    // Get the current time in 'Asia/Kolkata' timezone
    const currentTimeString = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = new Date(currentTimeString);

    // Get the food time in 'Asia/Kolkata' timezone
    const [hours, minutes] = time.split(":").map(Number);
    const foodTime = new Date(currentTimeString); // Start with the current time
    foodTime.setHours(hours); // Set the hours
    foodTime.setMinutes(minutes); // Set the minutes
    foodTime.setSeconds(0); // Set the seconds to 0

    // Calculate the food time 1 hour before
    const foodTime1HoursBefore = new Date(foodTime.getTime() - 1000 * 60 * 60);

    if (foodTime1HoursBefore > currentTime) {
      return res.status(401).json({ msg: "time not reached yet" });
    }

    const foodLogData = await FoodLog.findById(foodDocId);

    if (foodTime > currentTime) {
      if (foodLogData) {
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
  const requstedUser: string | string[] | any = req.headers["user"];
  const id = requstedUser.userId;
  const userDate = new Date(req.params.date); // assuming date is passed as a parameter in the request
  console.log("userDate with new date only================", userDate);

  const today1 = new Date(
    new Date(req.params.date).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

  console.log("date of today1", today1);


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

export const setRating = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { rating, trainerId, content } = req.body;
    const requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;

    const newReview = new Review({
      userId: id,
      trainerId,
      rating,
      content,
    });

    const review = await newReview.save();

    const averageReview = await Review.aggregate([
      {
        $group: {
          _id: "$trainerId",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const avgReviewRating = Math.round(averageReview[0].avgRating);

    const updateInTrainer = await Trainer.findByIdAndUpdate(trainerId, {
      $push: { reviews: review._id },
      avgRating: avgReviewRating,
    });
    // console.log("updateInTrainer", updateInTrainer);
    updateInTrainer && res.status(200).json({ msg: "review added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error", error });
  }
};

export const trainerOnlineStatus = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { trainerId, userId } = req.params;

    const trainer = await Trainer.findById(trainerId);

    if (!trainer) {
      return res.status(400).json({ msg: "no trainer found" });
    }

    const onlineStatus = trainer.isOnline;

    const pendingMessages = await Chat.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$message",
      },
      {
        $match: {
          "message.isSeen": false,
          "message.receiverId": new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $count: "pendingMessagesCount",
      },
    ]);

    // console.log("pendingMessages", pendingMessages);
    const pendingMessageCount = pendingMessages[0]?.pendingMessagesCount || 0;
    res.status(200).json({
      msg: "onlineStatus",
      onlineStatus,
      pendingMessageCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error", error });
  }
};

export const applyReason = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { reason, yesterdayAttendanceId, agree } = req.body;

    const reasonToAdd = agree ? reason : "Reason not Added";

    const ans = await Attendance.findOneAndUpdate(
      { _id: yesterdayAttendanceId },
      { notCompleteReason: reasonToAdd }
    );

    // console.log("ans", ans);
    res.status(200).json({ msg: "reason applied successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error", error });
  }
};

export const getUserName = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const requestedUser: any = req.headers["user"];

    // console.log("requestedUser", requestedUser);
    res.status(200).json({ msg: "user email", email: requestedUser.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error", error });
  }
};
