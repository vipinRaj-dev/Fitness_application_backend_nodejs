import express from "express";
import { tokenVerify } from "../middleware/tokenVerify";
import {
  addCertificateAndClient,
  deleteCertificateOrClient,
  trainerProfile,
  trainerProfileImageUpdate,
} from "../controllers/trainerProfileController";
import upload from "../middleware/upload";
import {
  SingleClient,
  TrainerGetAllFood,
  addFoodTrainer,
  allClients,
  removeFoodTrainer,
  setTime,
  singleFoodDelete,
} from "../controllers/trainerUserControllers";
import { getAllFood } from "../controllers/adminFoodController";

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

trainerRouter.delete(
  "/deleteCertificateOrClient",
  tokenVerify,
  deleteCertificateOrClient
);

trainerRouter.get("/allClients", tokenVerify, allClients);

trainerRouter.get("/client/:id", tokenVerify, SingleClient);

trainerRouter.get("/allFood/:id", tokenVerify, TrainerGetAllFood);

trainerRouter.post("/addFood/:id", tokenVerify, addFoodTrainer);

trainerRouter.delete(
  "/deleteFood/:clientId/:foodId",
  tokenVerify,
  removeFoodTrainer
);


trainerRouter.delete("/singleFoodDelete/:clientId/:foodDocId", tokenVerify, singleFoodDelete);

trainerRouter.put("/addTimeDetails/:clientId/:foodDocId", tokenVerify, setTime);

export default trainerRouter;
