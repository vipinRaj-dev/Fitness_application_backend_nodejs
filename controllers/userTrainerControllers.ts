import express from "express";

import { Trainer } from "../models/TrainerModel";

export const getAllTrainers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    console.log("get all trainers");
    const allTrainers = await Trainer.find().select(
      "_id name email isBlocked profilePicture experience specializedIn price description   "
    );
    if (!allTrainers) {
      return res.status(400).json({
        msg: "no trainers found",
      });
    }
    res.status(200).json({ msg: "all trainers", trainers: allTrainers });
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
    }

