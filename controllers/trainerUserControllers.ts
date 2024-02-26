import express from "express";
import { Trainer } from "../models/TrainerModel";

export const allClients = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];
    console.log(requstedUser);

    const allClients = await Trainer.findById(requstedUser.userId).populate(
      "clients"
    );
    // console.log(allClients.clients);
    res.status(200).json(allClients.clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const SingleClient = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];
    const id = requstedUser.userId;
    const clientId = req.params.id;
    const singleClient = await Trainer.findById(id).populate("clients");
    // console.log(singleClient.clients);

    const client = singleClient.clients.find(
      (client: any) => client._id == clientId
    );
    console.log(client);
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};
