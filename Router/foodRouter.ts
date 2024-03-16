import express from "express";
import {
  addFoodToLatestDiet,
  clientDetailsAndLatestFood,
  decreasePerFoodQuantity,
  deletePerFood,
  getAllFood,
  getClientFoodDetails,
  setTimeDetails,
} from "../controllers/userTrainerFoodController";



const foodRouter: express.Router = express.Router();

foodRouter.get("/client/:id", clientDetailsAndLatestFood);

foodRouter.get("/allFood/:id", getAllFood);

foodRouter.post("/addFood/:id", addFoodToLatestDiet);

foodRouter.put("/addTimeDetails/:clientId/:foodDocId", setTimeDetails);

foodRouter.delete("/deletePerFood/:clientId/:foodDocId", deletePerFood);

foodRouter.delete("/deleteFood/:clientId/:foodId", decreasePerFoodQuantity);

foodRouter.get('/getFood/:userId/:date', getClientFoodDetails);



export default foodRouter;
