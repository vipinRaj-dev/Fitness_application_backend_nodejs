import express from "express";
import { Trainer } from "../models/TrainerModel";
import { User } from "../models/UserModel";
import { Food } from "../models/ListOfFood";
import { Attendance } from "../models/AttendanceModel";

export const allClients = async (
  req: express.Request,
  res: express.Response
) => {
  // try {
  let requstedUser: any = req.headers["user"];
  console.log(requstedUser);

  //   const allClients = await Trainer.findById(requstedUser.userId).populate(
  //     "clients"
  //   );
  //   // console.log(allClients.clients);
  //   res.status(200).json(allClients.clients);
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({
  //     msg: "server error",
  //   });
  // }
  const page = parseInt(req.query.page as string) - 1 || 0;
  const limit = parseInt(req.query.limit as string) || 3;
  const search = (req.query.search as string) || "";
  // let sort = (req.query.sort as string) || "weight";

  // console.log(page, limit, search);

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
export const getClientFoodDetails = async (
  req : express.Request,
  res : express.Response
) => {

  const { userId, date } = req.params;
  console.log(userId, date); 
  const userDate = new Date(req.params.date);
  const startOfUserDate = new Date(userDate.setHours(0, 0, 0, 0));
  const endOfTheDay = new Date(userDate.setHours(23, 59, 59, 999));

  console.log("startOfUserDate", startOfUserDate);
  console.log("endOfTheDay", endOfTheDay);

  const attandanceData = await Attendance.findOne({
    userId: userId,
    date: {
      $gte: startOfUserDate,
      $lt: endOfTheDay,
    },
  }).populate({
    path: "foodLogs",
    populate: {
      path: "foodId",
    },
  });

  // console.log("attandanceData", attandanceData);
  res.status(200).json({ msg: "attandanceData", attandanceData });
}
