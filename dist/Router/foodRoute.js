"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userTrainerFoodController_1 = require("../controllers/userTrainerFoodController");
const tokenVerify_1 = require("../middleware/tokenVerify");
const foodRouter = express_1.default.Router();
foodRouter.get("/client/:id", userTrainerFoodController_1.clientDetailsAndLatestFood);
foodRouter.get("/allFood/:id", userTrainerFoodController_1.getAllFood);
foodRouter.post("/addFood/:id", userTrainerFoodController_1.addFoodToLatestDiet);
foodRouter.put("/addTimeDetails/:clientId/:foodDocId", userTrainerFoodController_1.setTimeDetails);
foodRouter.delete("/deletePerFood/:clientId/:foodDocId", userTrainerFoodController_1.deletePerFood);
foodRouter.delete("/deleteFood/:clientId/:foodId", userTrainerFoodController_1.decreasePerFoodQuantity);
foodRouter.get("/getFoodAndWorkouts/:userId/:date", userTrainerFoodController_1.getClientFoodDetails);
foodRouter.get("/updateExisting", tokenVerify_1.tokenVerify, userTrainerFoodController_1.UpdateDiet);
exports.default = foodRouter;
