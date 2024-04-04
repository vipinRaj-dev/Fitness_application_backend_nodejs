"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workoutController_1 = require("../controllers/workoutController");
const tokenVerify_1 = require("../middleware/tokenVerify");
const workoutRouter = express_1.default.Router();
// Trainer realted routes
workoutRouter.get("/", workoutController_1.getWorkouts);
workoutRouter.put("/set", workoutController_1.setWorkout);
workoutRouter.get("/getWorkoutsTrainer/:userId", workoutController_1.getTrainerWorkouts);
workoutRouter.put("/editSet", workoutController_1.editSet);
workoutRouter.delete("/deleteSet/:documentId/:workoutSetId/:eachWorkoutSetId", workoutController_1.deleteWorkoutSet);
workoutRouter.delete('/deleteWorkout/:documentId/:workoutSetId', workoutController_1.deleteWorkout);
workoutRouter.put('/addNewSet', workoutController_1.addNewSet);
// user with trainer related routes
workoutRouter.get('/getWorkouts', tokenVerify_1.tokenVerify, workoutController_1.getWorkoutsUser);
workoutRouter.put('/updateCompletedReps', tokenVerify_1.tokenVerify, workoutController_1.updateCompletedReps);
exports.default = workoutRouter;
