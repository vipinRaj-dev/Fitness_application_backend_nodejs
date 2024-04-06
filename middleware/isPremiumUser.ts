import express from "express";
import { User } from "../models/UserModel";

export const isPremiumUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
     const requstedUser: string | string[] | any = req.headers["user"];


    const user = await User.findById(requstedUser.userId);
    if (user) {
      if (user.isPremiumUser && user.dueDate > new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })) ) {
        next(); 
      } else if (user.trialEndsAt >new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))) {
        next();
      } else {
        res
          .status(402)
          .json({ msg: "user is normal user", userType: "normal" });
      }
    }
  } catch (error) {
    console.error("error from the isPremiumUser : ", error);
  }
};
