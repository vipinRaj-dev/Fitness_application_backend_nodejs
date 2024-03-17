import express from "express";

import { Trainer } from "../models/TrainerModel";
import { User } from "../models/UserModel";
import { Food } from "../models/ListOfFood";
import { Attendance } from "../models/AttendanceModel";

export const clientDetailsAndLatestFood = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const clientId = req.params.id;
    // console.log('clientid' , clientId)

    const client = await User.findById(clientId).populate("latestDiet.foodId");
    // console.log(client.latestDiet);
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const setTimeDetails = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const clientId = req.params.clientId;
    const foodDocId = req.params.foodDocId;

    const client = await User.findById(clientId);

    const AddTimeDetails = {
      time: req.body.time,
      timePeriod: req.body.timePeriod,
      quantity: req.body.quantity,
    };
    // console.log(AddTimeDetails);
    const clientFood = client.latestDiet.find(
      (food: any) => food._id == foodDocId
    );
    if (clientFood) {
      clientFood.time = AddTimeDetails.time;
      clientFood.timePeriod = AddTimeDetails.timePeriod;
      clientFood.quantity = AddTimeDetails.quantity;

      await client.save();
    }

    res.status(200).json({ msg: "time set succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
  }
};

export const deletePerFood = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const clientId = req.params.clientId;
    const foodDocId = req.params.foodDocId;

    // console.log(clientId, foodDocId);
    const ans = await User.updateOne(
      { _id: clientId },
      { $pull: { latestDiet: { _id: foodDocId } } }
    );
    // console.log(ans);
    res.status(200).json({ msg: "food removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
  }
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

    const clientId = req.params.id;
    // console.log("clientid ", clientId);
    const allFood = await Food.find(query)
      .skip(page * limit)
      .limit(limit);

    const user = await User.findById({ _id: clientId });
    const listOfFood = user?.latestDiet;
    const foodIds = listOfFood.map((food) => food.foodId);
    res.status(200).json({
      allFood: allFood,
      listOfFood: foodIds,
      page: page + 1,
      limit,
      totalFoodCount,
    });
  } catch (error) {
    console.error("Error getting all food:", error);
    res.status(500).json({ msg: "Error getting all food", error });
  }
};

export const addFoodToLatestDiet = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const clientId = req.params.id;
    const { foodId } = req.body;

    // console.log(foodId, clientId);

    const food = await Food.findById(foodId);
    // console.log(food._id);
    const foodToAdd = {
      date: new Date(),
      foodId: food._id,
    };

    const client = await User.findById(clientId);
    // console.log(client.latestDiet);
    const ans = await User.updateOne(
      { _id: clientId },
      { $push: { latestDiet: foodToAdd } }
    );

    // console.log(ans);

    res.status(200).json({ msg: "food added", foodId: food._id });
  } catch (error) {
    // console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const decreasePerFoodQuantity = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const clientId = req.params.clientId;
    const foodId = req.params.foodId;
    // console.log(foodId);
    const client = await User.findById(clientId);

    const findFood = client.latestDiet.find((food: any) => {
      // console.log(food);
      return food.foodId == foodId;
    });

    // console.log("findFood" , findFood);

    const ans = await User.updateOne(
      { _id: clientId },
      { $pull: { latestDiet: { _id: findFood._id } } }
    );

    // console.log(ans);
    res.status(200).json({ msg: "food removed" });
  } catch (error) {
    console.error(error);
  }
};

export const getClientFoodDetails = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, date } = req.params;
  // console.log(userId, date);
  const userDate = new Date(req.params.date);
  const startOfUserDate = new Date(userDate.setHours(0, 0, 0, 0));
  const endOfTheDay = new Date(userDate.setHours(23, 59, 59, 999));

  // console.log("startOfUserDate", startOfUserDate);
  // console.log("endOfTheDay", endOfTheDay);

  const attandanceData = await Attendance.findOne({
    userId: userId,
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
      path: 'workOutLogs',
      populate: {
        path: 'workOuts.workoutId'
      }
    });

  // console.log("attandanceData", attandanceData.workOutLogs);
  res.status(200).json({ msg: "attandanceData", attandanceData });
};
