"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenVerify_1 = require("../middleware/tokenVerify");
const adminController_1 = require("../controllers/adminController");
const isAdmin_1 = require("../middleware/isAdmin");
const upload_1 = __importDefault(require("../middleware/upload"));
const adminFoodController_1 = require("../controllers/adminFoodController");
const adminWorkoutController_1 = require("../controllers/adminWorkoutController");
const adminRouter = express_1.default.Router();
// USER ROUTES
adminRouter.use(tokenVerify_1.tokenVerify, isAdmin_1.isAdmin);
adminRouter.get("/dashboard", adminController_1.dashboard);
adminRouter.put("/profile/:id", adminController_1.adminProfileEdit);
adminRouter.get("/users", adminController_1.getAllUsers);
adminRouter.post("/createUser", adminController_1.createUser);
adminRouter.get("/user/:id", adminController_1.getUser);
adminRouter.put("/user/:id", adminController_1.userProfileEdit);
adminRouter.put("/user/block/:id", adminController_1.blockUser);
adminRouter.post("/addFood", upload_1.default.single("image"), adminFoodController_1.addFood);
adminRouter.get("/food", adminFoodController_1.getAllFood);
adminRouter.get("/food/:id", adminFoodController_1.getSingleFood);
adminRouter.put("/editFood/:id", upload_1.default.single("image"), adminFoodController_1.updateFood);
adminRouter.delete("/deleteFood/:id", adminFoodController_1.deleteFood);
adminRouter.post('/addWorkout', upload_1.default.single('video'), adminWorkoutController_1.addWorkout);
adminRouter.get('/workouts', adminWorkoutController_1.getAllWorkout);
adminRouter.delete('/deleteWorkout/:workoutId', adminWorkoutController_1.deleteWorkout);
adminRouter.get('/workout/:workoutId', adminWorkoutController_1.getSingleWorkout);
adminRouter.put('/editWorkout/:workoutId', upload_1.default.single('video'), adminWorkoutController_1.updateWorkout);
// TRAINER ROUTES
adminRouter.get("/trainers", adminController_1.getAllTrainers);
adminRouter.post("/createTrainer", adminController_1.createTrainer);
adminRouter.get("/trainer/:id", adminController_1.getTrainer);
adminRouter.put("/trainer/:id", adminController_1.trainerProfileEdit);
adminRouter.put("/trainer/block/:id", adminController_1.blockTrainer);
// payment routes
adminRouter.get("/payments", adminController_1.getAdminPayments);
// graph routes
adminRouter.get("/graph", tokenVerify_1.tokenVerify, isAdmin_1.isAdmin, adminController_1.getGraphDataAdmin);
exports.default = adminRouter;
