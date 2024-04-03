import express from "express";
import { Trainer, TrainerType } from "../models/TrainerModel";

export const isTrainerBlocked = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const requstedUser: string | string[] | any = req.headers["user"];

  const trainerData: TrainerType | null = await Trainer.findById(
    requstedUser.userId
  );

  if (!trainerData) {
    return res.status(400).json({
      msg: "no trainer data",
    });
  } else if (trainerData.isBlocked) {
    console.log("trainer blocked");
    return res.status(404).json({
      msg: "Trainer is blocked",
    });
  } else {
    next();
  }
};
