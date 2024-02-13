import express from "express";

import { tokenVerify } from "../middleware/tokenVerify";
import {
  userProfile,
  userProfileImageUpdate,
} from "../controllers/userProfileController";

import upload from "../middleware/upload";

const userRouter: express.Router = express.Router();

userRouter.get("/profile", tokenVerify, userProfile);

userRouter.put(
  "/profileUpdate",
  tokenVerify,
  upload.single("image"),
  userProfileImageUpdate
);

export default userRouter;
