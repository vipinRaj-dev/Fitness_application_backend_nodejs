
import express from 'express'
import { tokenVerify } from '../middleware/tokenVerify'
import { dashboard } from '../controllers/adminController'

const adminRouter :express.Router =express.Router()



adminRouter.get('/dashboard' , tokenVerify , dashboard)

export default adminRouter
