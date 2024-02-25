import express from "express";
import { Trainer } from "../models/TrainerModel";

export const allClients = async (req: express.Request, res: express.Response) => {
  try {
    let requstedUser: any = req.headers["user"]
    console.log(requstedUser);

    const allClients = await Trainer.findById(requstedUser.userId).populate('clients');
    console.log(allClients.clients);
    res.status(200).json(allClients.clients)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};
