import express from "express";
import { tokenVerify } from "../middleware/tokenVerify";
import {
  addCertificateAndClient,
  // profileUpdate,
  trainerProfile,
  trainerProfileImageUpdate,
} from "../controllers/trainerProfileController";
import upload from "../middleware/upload";

const trainerRouter: express.Router = express.Router();

trainerRouter.get("/profile", tokenVerify, trainerProfile);

// trainerRouter.put("/profileUpdate", tokenVerify, profileUpdate);

trainerRouter.put(
  "/profileUpdate",
  tokenVerify,
  upload.single("image"),
  trainerProfileImageUpdate
);

trainerRouter.put(
  "/addClientOrCertificate",
  tokenVerify,
  upload.single("image"),
  addCertificateAndClient
);
export default trainerRouter;
