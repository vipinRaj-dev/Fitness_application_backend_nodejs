import express from 'express'

import { tokenVerify } from '../middleware/tokenVerify';
import { userProfile } from '../controllers/userProfileController';

const userRouter: express.Router = express.Router();



userRouter.get("/profile", tokenVerify, userProfile);



export default userRouter;
