import express from "express";
import {
  addNewSet,
  deleteWorkout,
    deleteWorkoutSet,
  editSet,
  getTrainerWorkouts,
  getWorkouts,
  getWorkoutsUser,
  setWorkout,
  updateCompletedReps,
} from "../controllers/WorkoutControllers";
import { tokenVerify } from "../middleware/tokenVerify";

const workoutRouter = express.Router();


// Trainer realted routes

workoutRouter.get("/", getWorkouts);

workoutRouter.put("/set", setWorkout);

workoutRouter.get("/getWorkoutsTrainer/:userId", getTrainerWorkouts);

workoutRouter.put("/editSet", editSet);

workoutRouter.delete(
  "/deleteSet/:documentId/:workoutSetId/:eachWorkoutSetId" ,
  deleteWorkoutSet
);

workoutRouter.delete('/deleteWorkout/:documentId/:workoutSetId', deleteWorkout)

workoutRouter.put('/addNewSet' , addNewSet)



// user with trainer related routes


workoutRouter.get('/getWorkouts' ,tokenVerify, getWorkoutsUser)

workoutRouter.put('/updateCompletedReps' , tokenVerify , updateCompletedReps) 

export default workoutRouter;
