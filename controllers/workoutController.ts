import express from "express";
import { Workout } from "../models/ListOfWorkout";
import { User } from "../models/UserModel";
import { WorkoutLog } from "../models/WorkoutLogModel";
import { Attendance } from "../models/AttendanceModel";

export const getWorkouts = async (
  req: express.Request,
  res: express.Response
) => {
  // console.log("getWorkouts");
  try {
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 3;
    const search = (req.query.search as string) || "";
    const filter = (req.query.filter as string) || "";

    const query = {
      ...(search
        ? {
            $or: [
              { workoutName: new RegExp(search, "i") },
              { targetMuscle: new RegExp(search, "i") },
            ],
          }
        : {}),
      ...(filter ? { targetMuscle: filter } : {}),
    };

    const totalWorkoutCount = await Workout.countDocuments(query);

    const allWorkouts = await Workout.find(query)
      .skip(page * limit)
      .limit(limit);

    // console.log(allWorkouts);
    res.status(200).json({ allWorkouts, totalWorkoutCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const setWorkout = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { workoutId, clientId, workoutSet } = req.body;

    // console.log(workoutId, clientId, workoutSet);

    const userDetails = await User.findById(clientId);

    const attendanceDoc = await Attendance.findOne({
      _id: userDetails?.attendanceId,
    });

    if (attendanceDoc) {
      if (attendanceDoc.workOutLogs) {
        const workoutLog = await WorkoutLog.findById(attendanceDoc.workOutLogs);
        if (workoutLog) {
          workoutLog.workOuts.push({
            workoutId,
            workoutSet,
          });
          await workoutLog.save();
        }
      } else {
        const workoutLog = new WorkoutLog({
          userId: clientId,
          date: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })),
          workOuts: [
            {
              workoutId,
              workoutSet,
            },
          ],
        });

        const saved = await workoutLog.save();
        attendanceDoc.workOutLogs = saved._id;
        await attendanceDoc.save();
      }
      res.status(200).json({ message: "Workout Set Successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTrainerWorkouts = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const userId = req.params.userId;
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
    const startDate = date.setHours(0, 0, 0, 0);
    const endDate = date.setHours(23, 59, 59, 999);
    const workOutLogData = await WorkoutLog.findOne({
      userId,
      date: { $gte: startDate, $lt: endDate },
    }).populate("workOuts.workoutId");

    if (workOutLogData) {
      // console.log(workOutLogData);

      res.status(200).json({
        workOutData: workOutLogData.workOuts,
        documentId: workOutLogData._id,
      });
    } else {
      res.status(404).json({ message: "No Workouts Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editSet = async (req: express.Request, res: express.Response) => {
  try {
    const { documentId, workoutSetId, eachWorkoutSetId, reps, weight } =
      req.body;

    // console.log(eachWorkoutSetId, workoutSetId, documentId, reps, weight);

    const workoutLog = await WorkoutLog.findOne({ _id: documentId });

    // console.log(workoutLog);

    const workoutfound = workoutLog?.workOuts.find((workout) => {
      return workout._id == workoutSetId;
    });

    // console.log(workoutfound);

    const foundSet = workoutfound?.workoutSet.find((set) => {
      return set._id == eachWorkoutSetId;
    });

    // console.log(foundSet);

    if (foundSet) {
      foundSet.reps = reps;
      foundSet.weight = weight;
      await workoutLog?.save();
      res.status(200).json({ message: "Workout Set Successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteWorkoutSet = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { documentId, workoutSetId, eachWorkoutSetId } = req.params;

    // console.log(documentId, workoutSetId, eachWorkoutSetId);
    const workoutLog = await WorkoutLog.findOne({ _id: documentId });

    // console.log(workoutLog);

    const workoutfound = workoutLog?.workOuts.find((workout) => {
      return workout._id.toString() == workoutSetId;
    });

    // console.log(workoutfound);

    const foundSet = workoutfound?.workoutSet.find((set) => {
      return set._id.toString() == eachWorkoutSetId;
    });

    // console.log(foundSet);

    if (foundSet) {
      workoutfound?.workoutSet.pull({ _id: foundSet._id });
      await workoutLog?.save();
      res.status(200).json({ message: "Workout Set Successfully" });
    } else {
      res.status(404).json({ message: "Workout Set not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addNewSet = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { documentId, workoutSetId, reps, weight } = req.body;

    const workoutLog = await WorkoutLog.findOne({ _id: documentId });

    const workoutfound = workoutLog?.workOuts.find((workout) => {
      return workout._id == workoutSetId;
    });

    if (workoutfound) {
      workoutfound.workoutSet.push({ reps, weight, completedReps: 0 });
      await workoutLog?.save();
      res.status(200).json({ message: "Workout Add Set Successfully" });
    } else {
      res.status(404).json({ message: "Workout Set not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteWorkout = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { documentId, workoutSetId } = req.params;
    // console.log("deleteWorkout", documentId, workoutSetId);
    const workoutLog = await WorkoutLog.findOne({ _id: documentId });
    const workoutfound = workoutLog?.workOuts.find((workout) => {
      return workout._id.toString() == workoutSetId;
    });

    if (workoutfound) {
      workoutLog?.workOuts.pull({ _id: workoutfound._id });
      await workoutLog?.save();
      res.status(200).json({ message: "Workout Set deleted Successfully" });
    } else {
      res.status(404).json({ message: "Workout Set not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// user with trainer related controllers

export const getWorkoutsUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId }: string | string[] | any = req.headers["user"];

    // console.log(userId);
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const startDate = date.setHours(0, 0, 0, 0);
    const endDate = date.setHours(23, 59, 59, 999);
    const workOutLogData = await WorkoutLog.findOne({
      userId,
      date: { $gte: startDate, $lt: endDate },
    }).populate("workOuts.workoutId");

    if (workOutLogData) {
      // console.log(workOutLogData);

      res.status(200).json({
        workOutData: workOutLogData.workOuts,
        documentId: workOutLogData._id,
      });
    } else {
      res.status(404).json({ message: "No Workouts Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCompletedReps = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { documentId, workoutSetId, eachWorkoutSetId, completedReps } =
      req.body;

    const workoutLog = await WorkoutLog.findOne({ _id: documentId });

    const workoutfound = workoutLog?.workOuts.find((workout) => {
      return workout._id == workoutSetId;
    });

    const foundSet = workoutfound?.workoutSet.find((set) => {
      return set._id == eachWorkoutSetId;
    });

    if (foundSet) {
      foundSet.completedReps = completedReps;
      await workoutLog?.save();
      res.status(200).json({ message: "Workout Set Successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
