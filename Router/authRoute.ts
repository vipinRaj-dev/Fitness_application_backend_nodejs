import express from "express";


import {
  userLogin,
  userRegister,
} from "../controllers/authController";

const authRouter: express.Router = express.Router();

authRouter.post("/registration", userRegister);

authRouter.post("/login", userLogin);


export default authRouter;
