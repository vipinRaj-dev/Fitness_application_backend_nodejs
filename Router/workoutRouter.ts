import express from "express";
import {
    deleteWorkoutSet,
  editSet,
  getTrainerWorkouts,
  getWorkouts,
  setWorkout,
} from "../controllers/WorkoutControllers";

const workoutRouter = express.Router();

workoutRouter.get("/", getWorkouts);

workoutRouter.put("/set", setWorkout);

workoutRouter.get("/getWorkoutsTrainer/:userId", getTrainerWorkouts);

workoutRouter.put("/editSet", editSet);

workoutRouter.delete(
  "/deleteSet/:documentId/:workoutSetId/:eachWorkoutSetId" ,
  deleteWorkoutSet
);

export default workoutRouter;
