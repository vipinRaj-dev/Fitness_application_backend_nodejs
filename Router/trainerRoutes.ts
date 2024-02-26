import express from "express";
import { tokenVerify } from "../middleware/tokenVerify";
import {
  addCertificateAndClient,
  deleteCertificateOrClient,
  trainerProfile,
  trainerProfileImageUpdate,
} from "../controllers/trainerProfileController";
import upload from "../middleware/upload";
import { allClients } from "../controllers/trainerUserControllers";

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
  "/addCertificate",
  tokenVerify,
  upload.single("image"),
  addCertificateAndClient
);

trainerRouter.delete("/deleteCertificateOrClient", tokenVerify, deleteCertificateOrClient);


trainerRouter.get(('/allClients') , tokenVerify , allClients) 
export default trainerRouter;
