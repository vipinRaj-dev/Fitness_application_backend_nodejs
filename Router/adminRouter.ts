import express from "express";
import { tokenVerify } from "../middleware/tokenVerify";
import {
  adminProfileEdit,
  blockUser,
  createUser,
  dashboard,
  // deleteUser,
  getAllUsers,
  getUser,
  userProfileEdit,
} from "../controllers/adminController";
import { isAdmin } from "../middleware/isAdmin";

const adminRouter: express.Router = express.Router();



adminRouter.get("/dashboard", dashboard);

adminRouter.put("/profile/:id", tokenVerify, isAdmin,adminProfileEdit);

adminRouter.get("/users", tokenVerify, isAdmin,getAllUsers);

adminRouter.post("/createUser",tokenVerify, isAdmin, createUser);

adminRouter.get("/user/:id",tokenVerify, isAdmin, getUser);

adminRouter.put("/user/:id",tokenVerify, isAdmin, userProfileEdit);

// adminRouter.delete("/user/:id", deleteUser);

adminRouter.put("/user/block/:id", tokenVerify, isAdmin,blockUser);


export default adminRouter;
