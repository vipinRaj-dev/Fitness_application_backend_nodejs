import express from "express";
import {
  removeFromCloudinary,
  removeVideoFromCloudinary,
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "../imageUploadConfig/cloudinary";
import { Food } from "../models/ListOfFood";
import { User } from "../models/UserModel";
import { Workout } from "../models/ListOfWorkout";

export const addFood = async (req: express.Request, res: express.Response) => {
  console.log("addFood");
  console.log(req.body);
  console.log(req.file);

  const {
    foodname,
    quantity,
    foodtype,
    unit,
    fat,
    carbohydrate,
    calories,
    description,
    ingredients,
    protein,
  } = req.body;

  try {
    let data = await uploadToCloudinary(req.file.path, "food-Images");
    console.log("data:", data);

    if (data && data.url && data.public_id) {
      //   console.log("data.url:", data.url);
      //   console.log("data.public_id:", data.public_id);
      //   console.log("ingredients:", ingredients.split(","));

      const newFood = new Food({
        foodname,
        description,
        quantity,
        unit,
        nutrition: {
          calories,
          protein,
          carbs: carbohydrate,
          fat,
        },
        ingredients: ingredients
          .split(",")
          .map((ingredient) => ingredient.trim()),
        photoUrl: data.url,
        publicId: data.public_id,
        foodtype,
      });
      const savedFood = await newFood.save();
      console.log("savedFood:", savedFood);
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return res.status(500).json({ msg: "Error uploading image", error });
  }

  res.status(200).json({ message: "Food added successfully" });
};

export const getAllFood = async (
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
              { foodname: new RegExp(search, "i") },
              { ingredients: new RegExp(search, "i") },
            ],
          }
        : {}),
      ...(filter ? { foodtype: filter } : {}),
    };

    const totalFoodCount = await Food.countDocuments(query);

    const allFood = await Food.find(query)
      .skip(page * limit)
      .limit(limit);

    res.status(200).json({
      allFood: allFood,
      page: page + 1,
      limit,
      totalFoodCount,
    });
  } catch (error) {
    console.error("Error getting all food:", error);
    res.status(500).json({ msg: "Error getting all food", error });
  }
};

export const getSingleFood = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const food = await Food.findById(req.params.id);

    res.status(200).json(food);
  } catch (error) {
    console.error("Error getting single food:", error);
    res.status(500).json({ msg: "Error getting single food", error });
  }
};

export const updateFood = async (
  req: express.Request,
  res: express.Response
) => {
  const {
    foodname,
    quantity,
    foodtype,
    unit,
    fat,
    carbohydrate,
    calories,
    description,
    ingredients,
    protein,
  } = req.body;

  try {
    const foodData = await Food.findById(req.params.id);
    if (!foodData) {
      return res.status(404).json({ msg: "Food not found" });
    }

    let data;
    if (req.file?.path && foodData?.publicId) {
      await removeFromCloudinary(foodData.publicId);
      await foodData.updateOne(
        { _id: req.params.id },
        { $unset: { photoUrl: "", publicId: "" } }
      );
      data = await uploadToCloudinary(req.file.path, "food-Images");
    }

    const updatedFood = {
      foodname,
      description,
      quantity,
      unit,
      nutrition: {
        calories,
        protein,
        carbs: carbohydrate,
        fat,
      },
      ingredients: ingredients
        .split(",")
        .map((ingredient) => ingredient.trim()),
      foodtype,
      ...(data && { photoUrl: data.url, publicId: data.public_id }),
    };

    const savedFood = await Food.findByIdAndUpdate(req.params.id, updatedFood, {
      new: true,
    });

    res.status(200).json({ message: "Food updated successfully", savedFood });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ msg: "Error updating food", error });
  }
};

export const deleteFood = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let foodData = await Food.findById(req.params.id);

    if (foodData?.publicId) {
      let publicId = foodData.publicId;
      await removeFromCloudinary(publicId);
      await foodData.deleteOne();
    } else {
      console.log("no public id found");
    }

    res.status(200).json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).json({ msg: "Error deleting food", error });
  }
};

export const addWorkout = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    console.log("req.file:", req.file);
    if (req.file && req.file.path) {
      // await removeFromCloudinary("workout-Videos/lknzdrwawdsncuea41tf")
      let video: {
        url: string;
        public_id: string;
      } = await uploadVideoToCloudinary(req.file.path, "workout-Videos");
      let thumbnailUrl = video.url.replace("mp4", "jpg");
      console.log("video:", video);
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
      console.log("publicId:", publicId);
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
    console.log("data:", data);

    const updatedWorkout = {
      workoutName: req.body.workoutName,
      targetMuscle: req.body.targetMuscle,
      description: req.body.description,
      ...(data && { videoUrl: data.url, publicId: data.public_id , thumbnailUrl: data.url.replace("mp4", "jpg")}),
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
