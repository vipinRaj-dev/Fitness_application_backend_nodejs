import express from "express";

import { UserType, User } from "../models/UserModel";

export const userProfile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];

    let userData: UserType | null = await User.findById(
      requstedUser.userId
    ).select("-password");

    if (!userData) {
      return res.status(400).json({
        msg: "no user data",
      });
    }

    res.status(200).json({ msg: "user details", user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};
