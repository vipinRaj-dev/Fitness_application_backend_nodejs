import express from "express";
import dotenv from "dotenv";
dotenv.config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

import { tokenVerify } from "../middleware/tokenVerify";
import { isPremiumUser } from "../middleware/isPremiumUser";
import {
  addFoodLog,
  applyReason,
  getDay,
  getGraphDataUser,
  getUserName,
  setAttendance,
  setRating,
  trainerOnlineStatus,
  userHomePage,
  userProfile,
  userProfileImageUpdate,
} from "../controllers/userProfileController";

import upload from "../middleware/upload";
import {
  getAllTrainers,
  getSingleTrainer,
} from "../controllers/userTrainerController";
import {
  createCheckoutSession,
  handleWebhook,
} from "../controllers/paymentController";
import { IsUserBlocked } from "../middleware/isUserBlocked";

const userRouter: express.Router = express.Router();

userRouter.get(
  "/setAttendance",
  tokenVerify,
  isPremiumUser,
  setAttendance
);

userRouter.get(
  "/homePage",
  tokenVerify,
  IsUserBlocked,
  isPremiumUser,
  userHomePage
);

userRouter.get("/getGraphs", tokenVerify, getGraphDataUser);

userRouter.get(
  "/profile",
  tokenVerify,
  IsUserBlocked,
  isPremiumUser,
  userProfile
);

userRouter.put(
  "/profileUpdate",
  tokenVerify,
  IsUserBlocked,
  upload.single("image"),
  userProfileImageUpdate
);

userRouter.post(
  "/create-checkout-session",
  tokenVerify,
  IsUserBlocked,
  createCheckoutSession
);

userRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);
userRouter.get("/getAllTrainers", tokenVerify, IsUserBlocked, getAllTrainers);

userRouter.get(
  "/getTrainer/:id",
  tokenVerify,
  isPremiumUser,
  IsUserBlocked,
  getSingleTrainer
);

userRouter.put("/addFoodLog", tokenVerify, IsUserBlocked, addFoodLog);

userRouter.get("/getDate/:date", tokenVerify, IsUserBlocked, getDay);

userRouter.post("/rating", tokenVerify, IsUserBlocked, setRating);

userRouter.get(
  "/getTrainerOnlineStatus/:trainerId/:userId",
  tokenVerify,
  trainerOnlineStatus
);

userRouter.get("/getUser", tokenVerify, getUserName);

userRouter.post("/applyReason", tokenVerify, applyReason);
// userRouter.get("/attandance", attendance);

export default userRouter;
