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

const userRouter: express.Router = express.Router();

userRouter.get("/homePage", tokenVerify, isPremiumUser, userHomePage);

userRouter.get("/getGraphs", tokenVerify, getGraphDataUser);

userRouter.get("/profile", tokenVerify, isPremiumUser, userProfile);

userRouter.put(
  "/profileUpdate",
  tokenVerify,
  upload.single("image"),
  userProfileImageUpdate
);

userRouter.post("/create-checkout-session", tokenVerify, createCheckoutSession);

userRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);
userRouter.get("/getAllTrainers", tokenVerify, getAllTrainers);

userRouter.get("/getTrainer/:id", tokenVerify, isPremiumUser, getSingleTrainer);

userRouter.put("/addFoodLog", tokenVerify, addFoodLog);

userRouter.get("/getDate/:date", tokenVerify, getDay);

userRouter.post("/rating", tokenVerify, setRating);

userRouter.get('/getTrainerOnlineStatus/:trainerId/:userId' , tokenVerify , trainerOnlineStatus)

userRouter.get('/getUser' ,tokenVerify , getUserName)

userRouter.post('/applyReason' , tokenVerify , applyReason)
// userRouter.get("/attandance", attendance);

export default userRouter;
