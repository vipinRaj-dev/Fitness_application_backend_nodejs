import express from "express";
import {
  UpdateDiet,
  addFoodToLatestDiet,
  clientDetailsAndLatestFood,
  decreasePerFoodQuantity,
  deletePerFood,
  getAllFood,
  getClientFoodDetails,
  setTimeDetails,
} from "../controllers/userTrainerFoodController";
import { tokenVerify } from "../middleware/tokenVerify";

const foodRouter: express.Router = express.Router();

foodRouter.get("/client/:id", clientDetailsAndLatestFood);

foodRouter.get("/allFood/:id", getAllFood);

foodRouter.post("/addFood/:id", addFoodToLatestDiet);

foodRouter.put("/addTimeDetails/:clientId/:foodDocId", setTimeDetails);

foodRouter.delete("/deletePerFood/:clientId/:foodDocId", deletePerFood);

foodRouter.delete("/deleteFood/:clientId/:foodId", decreasePerFoodQuantity);

foodRouter.get("/getFoodAndWorkouts/:userId/:date", getClientFoodDetails);

foodRouter.put("/updateExisting", tokenVerify, UpdateDiet);

export default foodRouter;
