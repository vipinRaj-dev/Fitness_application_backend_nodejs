import express from "express";
import { tokenVerify } from "../middleware/tokenVerify";
import { getMessages } from "../controllers/chatControllers";



const chatRouter: express.Router = express.Router();



chatRouter.get("/getMessages/:trainerId/:userId" ,tokenVerify, getMessages);



export default chatRouter;