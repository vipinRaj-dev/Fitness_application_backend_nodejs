import express from "express";

import { tokenVerify } from "../middleware/tokenVerify";
import {
  attendance,
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

userRouter.get('/attandance', attendance)
export default userRouter;
