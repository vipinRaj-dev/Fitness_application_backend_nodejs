import express from "express";
import { Admin, AdminType } from "../models/AdminModel";
import { User } from "../models/UserModel";
import { Trainer } from "../models/TrainerModel";

export const dashboard = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];

    let adminData: AdminType | null = await Admin.findById(
      requstedUser.userId
    ).select("-password");
    // console.log(adminData);

    const userCount = await User.countDocuments();
    const trainerCount = await Trainer.countDocuments();

    if (!adminData) {
      return res.status(404).json({
        msg: "no user data",
      });
    }

    res
      .status(200)
      .json({
        msg: "Admin dashboard",
        adminDetails: adminData,
        userCount,
        trainerCount,
      });
  } catch (error) {
    console.error(error);
  }
};
