import express from "express";
import dotenv from "dotenv";
dotenv.config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

import { tokenVerify } from "../middleware/tokenVerify";
import { isPremiumUser } from "../middleware/isPremiumUser";
import {
  attendance,
  userProfile,
  userProfileImageUpdate,
} from "../controllers/userProfileController";

import upload from "../middleware/upload";
import {
  getAllTrainers,
  getSingleTrainer,
} from "../controllers/userTrainerControllers";
import {
  createCheckoutSession,
  handleWebhook,
} from "../controllers/paymentController";

const userRouter: express.Router = express.Router();

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

userRouter.get("/getTrainer/:id", tokenVerify, getSingleTrainer);

userRouter.get("/attandance", attendance);
export default userRouter;
