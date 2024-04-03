import express from "express";
import { User } from "../models/UserModel";

export const IsUserBlocked = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const requstedUser: string | string[] | any = req.headers["user"];

  if (requstedUser.role === "user") {
    const isUserBlocked = await User.findById(requstedUser.userId).select(
      "userBlocked"
    );
    console.log("isuser blocked ", isUserBlocked.userBlocked);
    if (isUserBlocked.userBlocked) {
      console.log("user blocked");
      return res.status(403).json({ msg: "user is blocked" });
    } else {
        console.log("user is not blocked");
      next();
    }
  }
};
