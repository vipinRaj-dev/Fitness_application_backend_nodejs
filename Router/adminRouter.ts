import express from "express";
import { tokenVerify } from "../middleware/tokenVerify";
import {
  adminProfileEdit,
  blockTrainer,
  blockUser,
  createTrainer,
  createUser,
  dashboard,
  getAllTrainers,
  getAllUsers,
  getTrainer,
  getUser,
  trainerProfileEdit,
  userProfileEdit,
} from "../controllers/adminController";
import { isAdmin } from "../middleware/isAdmin";
import upload from "../middleware/upload";
import { addFood, deleteFood, getAllFood, getSingleFood, updateFood } from "../controllers/adminFoodController";

const adminRouter: express.Router = express.Router();

// USER ROUTES
adminRouter.use(tokenVerify, isAdmin);

adminRouter.get("/dashboard", dashboard);

adminRouter.put("/profile/:id", adminProfileEdit);

adminRouter.get("/users", getAllUsers);

adminRouter.post("/createUser", createUser);

adminRouter.get("/user/:id", getUser);

adminRouter.put("/user/:id", userProfileEdit);

adminRouter.put("/user/block/:id", blockUser);

adminRouter.post("/addFood", upload.single("image"), addFood);

adminRouter.get("/food", getAllFood)

adminRouter.get("/food/:id", getSingleFood)

adminRouter.put("/editFood/:id", upload.single("image"), updateFood)

adminRouter.delete("/deleteFood/:id", deleteFood)

// TRAINER ROUTES

adminRouter.get("/trainers", getAllTrainers);

adminRouter.post("/createTrainer", createTrainer);

adminRouter.get("/trainer/:id", getTrainer);

adminRouter.put("/trainer/:id", trainerProfileEdit);

adminRouter.put("/trainer/block/:id", blockTrainer);

export default adminRouter;
