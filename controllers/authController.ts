import express from "express";

import jwt from "jsonwebtoken";

import { hashPassword, verifyPassword } from "../utils/password";

import { User, UserType } from "../models/UserModel";
import { Trainer, TrainerType } from "../models/TrainerModel";
import { Admin, AdminType } from "../models/AdminModel";

export const userRegister = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { name, email, password } = req.body;


    let user: UserType | TrainerType | AdminType;

    user = await User.findOne({ email: email });

    if (!user) {
      user = await Trainer.findOne({ email: email });
    }
    if (!user) {
      user = await Admin.findOne({ email: email });
    }

    if (user) {
      return res.status(400).json({ msg: "user already exists" });
    }

    let userCount = await User.countDocuments({});

    //hashing the password
    let hashedPassword: string = await hashPassword(password);

    //register the user
    let newUser = new User({
      admissionNumber: userCount + 1,
      name,
      email,
      password: hashedPassword,
    });

    newUser
      .save()
      .then((user: UserType) => {
        console.log("User saved successfully:", user);
        return res.status(200).json({ msg: "user registration successful" });
      })
      .catch((error: any) => {
        console.error("Error saving user:", error);
      });
  } catch (error) {
    res.status(500).json({ msg: "server error" });
  }
};

export const userLogin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, password } = req.body;

    let foundUser: UserType | TrainerType | AdminType;

    foundUser = await User.findOne({ email: email });

    if (!foundUser) {
      foundUser = await Trainer.findOne({ email: email });
    }
    if (!foundUser) {
      foundUser = await Admin.findOne({ email: email });
    }

    if (!foundUser) {
      return res.status(404).json({ msg: "user not found" });
    }

    let passwordMatch = await verifyPassword(password, foundUser.password);

    if (!passwordMatch) {
      return res.status(401).json({ msg: "password incorrect" });
    }

    // sending token

    let payload = {
      email: email,
      role: foundUser.role,
      userId: foundUser._id,
    };

    let token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    res.status(200).json({ msg: "Login succesfully", token: token , role:foundUser.role });
    // res.cookie("jwt", token, { httpOnly: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};


