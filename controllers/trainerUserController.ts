import express from "express";
import { Trainer } from "../models/TrainerModel";

export const allClients = async (
  req: express.Request,
  res: express.Response
) => {
  // try {
    const requstedUser: string | string[] | any = req.headers["user"];
  console.log(requstedUser);

  const page = parseInt(req.query.page as string) - 1 || 0;
  const limit = parseInt(req.query.limit as string) || 3;
  const search = (req.query.search as string) || "";

  const query = search
    ? {
        $or: [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ],
      }
    : {};

  try {
    const totalClients = await Trainer.findById(requstedUser.userId).populate({
      path: "clients",
      match: query,
      options: { skip: page * limit, limit: limit },
    });

    // console.log(totalClients);

    res.status(200).json({
      allClients: totalClients.clients,
      page: page + 1,
      limit,
      totalClients: totalClients.clients.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
