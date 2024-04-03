import express from "express";
import { tokenVerify } from "../middleware/tokenVerify";
import {
  adminProfileEdit,
  blockTrainer,
  blockUser,
  createTrainer,
  createUser,
  dashboard,
  getAdminPayments,
  getAllTrainers,
  getAllUsers,
  getGraphDataAdmin,
  getTrainer,
  getUser,
  trainerProfileEdit,
  userProfileEdit,
} from "../controllers/adminController";
import { isAdmin } from "../middleware/isAdmin";
import upload from "../middleware/upload";
import { addFood, deleteFood, getAllFood, getSingleFood, updateFood } from "../controllers/adminFoodController";
import { addWorkout, deleteWorkout, getAllWorkout, getSingleWorkout, updateWorkout } from "../controllers/adminWorkoutController";

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

adminRouter.post('/addWorkout' , upload.single('video') , addWorkout)

adminRouter.get('/workouts' , getAllWorkout)

adminRouter.delete('/deleteWorkout/:workoutId' , deleteWorkout)

adminRouter.get('/workout/:workoutId' , getSingleWorkout)

adminRouter.put('/editWorkout/:workoutId' , upload.single('video') , updateWorkout)

// TRAINER ROUTES

adminRouter.get("/trainers", getAllTrainers);

adminRouter.post("/createTrainer", createTrainer);

adminRouter.get("/trainer/:id", getTrainer);

adminRouter.put("/trainer/:id", trainerProfileEdit);

adminRouter.put("/trainer/block/:id", blockTrainer);



// payment routes

adminRouter.get("/payments", getAdminPayments);


// graph routes

adminRouter.get("/graph",  tokenVerify , isAdmin , getGraphDataAdmin )

export default adminRouter;
