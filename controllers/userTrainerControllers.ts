import express from "express";

import { Trainer } from "../models/TrainerModel";
import { User } from "../models/UserModel";

export const getAllTrainers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    console.log("get all trainers");

    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 3;
    const search = (req.query.search as string) || "";

    const query = search
      ? {
          $or: [
            { name: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
            { specializedIn: new RegExp(search, "i") },
          ],
        }
      : {};

    const totalTrainers = await Trainer.countDocuments(query)


    const { userId }: any = req.headers["user"];

    const user = await User.findById(userId);
    const TrainerId = user?.trainerId;
    const allTrainers = await Trainer.find({ _id: { $ne: TrainerId }, ...query })
      .skip(page * limit)
      .limit(limit)
      .select(
        "_id name email isBlocked profilePicture experience specializedIn price description"
      );
    if (!allTrainers) {
      return res.status(400).json({
        msg: "no trainers found",
      });
    }
    res
      .status(200)
      .json({
        msg: "all trainers",
        trainers: allTrainers,
        page: page + 1,
        limit,
        totalTrainers,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const getSingleTrainer = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const trainer = await Trainer.findById(id).select(
      "_id name email isBlocked profilePicture experience specializedIn price description transformationClients certifications"
    );
    if (!trainer) {
      return res.status(400).json({
        msg: "no trainer found",
      });
    }
    res.status(200).json({ msg: "trainer", trainer: trainer });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};
