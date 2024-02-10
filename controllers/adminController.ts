import express from "express";
import { Admin, AdminType } from "../models/AdminModel";
import { User, UserType } from "../models/UserModel";
import { Trainer } from "../models/TrainerModel";
import { hashPassword } from "../utils/password";

interface RequestedUser {
  email: string;
  role: string;
  userId: string;
  iat: number;
}

export const dashboard = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];

    let adminData: AdminType | null = await Admin.findById(requstedUser.userId);
    const userCount = await User.countDocuments();
    const trainerCount = await Trainer.countDocuments();

    if (!adminData) {
      return res.status(404).json({
        msg: "no user data",
      });
    }

    res.status(200).json({
      msg: "Admin dashboard",
      adminDetails: adminData,
      userCount,
      trainerCount,
    });
  } catch (error) {
    console.error(error);
  }
};

export const adminProfileEdit = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    // console.log(updateData  , id);
    // await db.collection('resources').updateOne({ _id: id }, { $set: updateData });

    res.json({ message: "Resource updated", data: updateData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, role: 1, _id: 0 });
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const userData: UserType = req.body;
    const isUserExist = await User.findOne({ email: userData.email });
    if (isUserExist) {
      return res.status(400).json({ message: "User already exist" });
    }
    const hashedPassword = await hashPassword(userData.password);
    const user = new User({ ...userData, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req: express.Request, res: express.Response) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const userProfileEdit = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    // console.log(updateData  , id);
    // await db.collection('resources').updateOne({ _id: id }, { $set: updateData });

    res.json({ message: " user Resource updated", data: updateData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const isUserExist = await User.findById(id);
    // await db.collection('resources').deleteOne({ _id: id });
    res.json({ message: "Resource deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
