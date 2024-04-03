import express from "express";
import {
  removeVideoFromCloudinary,
  uploadVideoToCloudinary,
} from "../imageUploadConfig/cloudinary";
import { Workout } from "../models/ListOfWorkout";

export const addWorkout = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // console.log("req.file:", req.file);
    if (req.file && req.file.path) {
      // await removeFromCloudinary("workout-Videos/lknzdrwawdsncuea41tf")
      let video: {
        url: string;
        public_id: string;
      } = await uploadVideoToCloudinary(req.file.path, "workout-Videos") || { url: "", public_id: "" };
      let thumbnailUrl = video.url.replace("mp4", "jpg");
      // console.log("video:", video);
      const newWorkout = new Workout({
        workoutName: req.body.workoutName,
        targetMuscle: req.body.targetMuscle,
        description: req.body.description,
        videoUrl: video.url,
        publicId: video.public_id,
        thumbnailUrl: thumbnailUrl,
      });
      let ans = await newWorkout.save();
      res.status(200).json({ message: "Workout added successfully", ans });
    } else {
      res.status(400).json({ message: "Please upload a video" });
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
  }
};

export const getAllWorkout = async (
  req: express.Request,
  res: express.Response
) => {
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
    };

    const totalWorkoutCount = await Workout.countDocuments(query);

    const allWorkout = await Workout.find(query)
      .skip(page * limit)
      .limit(limit);

    res.status(200).json({
      allWorkout: allWorkout,
      page: page + 1,
      limit,
      totalWorkoutCount,
    });
  } catch (error) {
    console.error("Error getting all workout:", error);
    res.status(500).json({ msg: "Error getting all workout", error });
  }
};

export const deleteWorkout = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let workoutData = await Workout.findById(req.params.workoutId);

    if (workoutData?.publicId) {
      let publicId = workoutData.publicId;
      // console.log("publicId:", publicId);
      await removeVideoFromCloudinary(publicId);
      await workoutData.deleteOne();
    } else {
      console.log("no public id found");
    }

    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ msg: "Error deleting workout", error });
  }
};
export const getSingleWorkout = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const workout = await Workout.findById(req.params.workoutId);

    // console.log("workout:", workout);
    res.status(200).json({ workoutData: workout });
  } catch (error) {
    console.error("Error getting single workout:", error);
    res.status(500).json({ msg: "Error getting single workout", error });
  }
};

export const updateWorkout = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const workoutData = await Workout.findById(req.params.workoutId);
    if (!workoutData) {
      return res.status(404).json({ msg: "Workout not found" });
    }

    let data;
    if (req.file?.path && workoutData?.publicId) {
      await removeVideoFromCloudinary(workoutData.publicId);
      await workoutData.updateOne(
        { _id: req.params.workoutId },
        { $unset: { videoUrl: "", publicId: "", thumbnailUrl: "" } }
      );
      data = await uploadVideoToCloudinary(req.file.path, "workout-Videos");
    }
    // console.log("data:", data);

    const updatedWorkout = {
      workoutName: req.body.workoutName,
      targetMuscle: req.body.targetMuscle,
      description: req.body.description,
      ...(data && {
        videoUrl: data.url,
        publicId: data.public_id,
        thumbnailUrl: data.url.replace("mp4", "jpg"),
      }),
    };

    const savedWorkout = await Workout.findByIdAndUpdate(
      req.params.workoutId,
      updatedWorkout,
      {
        new: true,
      }
    );

    res
      .status(200)
      .json({ message: "Workout updated successfully", savedWorkout });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ msg: "Error updating workout", error });
  }
};
