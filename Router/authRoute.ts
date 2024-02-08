import express from "express";


import {
  checkrole,
  userLogin,
  userRegister,
} from "../controllers/authController";
import { tokenVerify } from "../middleware/tokenVerify";

const authRouter: express.Router = express.Router();

authRouter.post("/registration", userRegister);

authRouter.post("/login", userLogin);

authRouter.get("/role" ,tokenVerify, checkrole)


export default authRouter;
