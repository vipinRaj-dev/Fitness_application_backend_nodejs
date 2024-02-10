import express from "express";
import { tokenVerify } from "../middleware/tokenVerify";
import {
  adminProfileEdit,
  createUser,
  dashboard,
  deleteUser,
  getAllUsers,
  getUser,
  userProfileEdit,
} from "../controllers/adminController";
import { isAdmin } from "../middleware/isAdmin";

const adminRouter: express.Router = express.Router();


adminRouter.use(tokenVerify, isAdmin);

adminRouter.get("/dashboard", dashboard);

adminRouter.put("/profile/:id", adminProfileEdit);

adminRouter.get("/users", getAllUsers);

adminRouter.post("/createUser", createUser);

adminRouter.get("/user/:id", getUser);

adminRouter.put("/user/:id", userProfileEdit);

adminRouter.delete("/user/:id", deleteUser);


export default adminRouter;
