import express from "express";
import { Admin, AdminType } from "../models/AdminModel";
import { User, UserType } from "../models/UserModel";
import { Trainer, TrainerType } from "../models/TrainerModel";
import { hashPassword } from "../utils/password";
import { AdminPayment } from "../models/PaymentsModel";
import { Food } from "../models/ListOfFood";
import { Workout } from "../models/ListOfWorkout";


// USER CONTROLLERS
export const dashboard = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let adminData: AdminType | null = await Admin.findOne({}).select(
      "role email fullName _id"
    );
    // console.log(adminData);

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
    const totalUsers = await User.countDocuments(query);

    // console.log(totalUsers);

    const users = await User.find(query)
      // .sort({ sort: -1 })
      .skip(page * limit)
      .limit(limit);

    res.status(200).json({
      users,
      page: page + 1,
      limit,
      totalUsers,
    });
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

    // console.log(updateData);
    let isUserExist = await Trainer.findOne({ email: updateData.email });

    if (!isUserExist) {
      isUserExist = await User.findOne({ email: updateData.email });
    }
    if (isUserExist) {
      return res.status(404).json({ message: "Email already exists" });
    }

    const isUserUpdated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!isUserUpdated) {
      return res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({ message: "User updated", user: isUserUpdated });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// export const deleteUser = async (

//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const id = req.params.id;
//     const isUserExist = await User.findById(id);
//     res.json({ message: "Resource deleted" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

export const blockUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    } else {
      // console.log(userDetails);
      userDetails.userBlocked = !userDetails.userBlocked;
      await userDetails.save();
      res.status(200).json({ message: "User blocked", user: userDetails });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// TRAINER CONTROLLERS

export const createTrainer = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const trainerData: TrainerType = req.body;
    // console.log(trainerData);
    const isTrainerExist = await User.findOne({ email: trainerData.email });
    if (isTrainerExist) {
      return res.status(400).json({ message: "User already exist" });
    }
    const hashedPassword = await hashPassword(trainerData.password);
    const user = new Trainer({ ...trainerData, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Trainer created", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllTrainers = async (
  req: express.Request,
  res: express.Response
) => {
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
    const totalTrainers = await Trainer.countDocuments(query);

    // console.log(totalTrainers);

    const trainer = await Trainer.find(query)
      // .sort({ sort: -1 })
      .skip(page * limit)
      .limit(limit);

    res.status(200).json({
      trainer,
      page: page + 1,
      limit,
      totalTrainers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const blockTrainer = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const trainerDetails = await Trainer.findById(id);
    if (!trainerDetails) {
      return res.status(404).json({ message: "Trainer not found" });
    } else {
      // console.log(trainerDetails);
      trainerDetails.isBlocked = !trainerDetails.isBlocked;
      await trainerDetails.save();
      res
        .status(200)
        .json({ message: "User blocked", trainer: trainerDetails });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getTrainer = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "trainer not found" });
    }
    res.status(200).json({ trainer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const trainerProfileEdit = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    let isUserExist: UserType;

    isUserExist = await User.findOne({ email: updateData.email });
    if (isUserExist) {
      return res.status(404).json({ message: "Email already exists" });
    }

    const isTrainerUpdated = await Trainer.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!isTrainerUpdated) {
      return res.status(404).json({ message: "Trainer not found" });
    } else {
      res
        .status(200)
        .json({ message: "Trainer updated", user: isTrainerUpdated });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// payment controllers

export const getAdminPayments = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const payments = await AdminPayment.find().populate({
      path: "clientDetails",
      select: "name email isPremium dueDate profileImage",
    });
    // console.log("payments", payments);

    
    res.status(200).json({ payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//Graph controllers

export const getGraphDataAdmin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // console.log("graph data");
    let totalRevenue: { totalRevenue: number }[],
      premiumUsers: number,
      trialUsers: number,
      trialExpired: number,
      totalTrainers: number;

    totalRevenue = await AdminPayment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
        },
      },
    ]);
    premiumUsers = await User.countDocuments({ isPremiumUser: true });

    trialUsers = await User.countDocuments({
      trialEndsAt: { $gte: new Date() },
      isPremiumUser: false,
    });

    trialExpired = await User.countDocuments({
      trialEndsAt: { $lt: new Date() },
      isPremiumUser: false,
    });

    totalTrainers = await Trainer.countDocuments();

    const userCountPerMonth = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthlyPayments = await AdminPayment.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          createdAt: 1,
          amount: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          totalAmount: { $sum: "$amount" },
          latestDate: { $max: "$createdAt" },
        },
      },
      {
        $sort: { latestDate: 1 },
      },
    ]);

    const foodCountWithFoodtype = await Food.aggregate([
      {
        $group: {
          _id: "$foodtype",
          count: { $sum: 1 },
        },
      },
    ]);

    const trainerWiseClientCount = await Trainer.aggregate([
      {
        $project: {
          name: 1,
          clientCount: { $size: "$clients" },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      totalRevenue: totalRevenue[0].totalRevenue,
      premiumUsers,
      trialUsers,
      trialExpired,
      totalTrainers,
      userCountPerMonth,
      monthlyPayments,
      foodCountWithFoodtype,
      trainerWiseClientCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
