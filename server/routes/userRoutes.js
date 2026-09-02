import express from 'express';
import { coursePurchase, getUserData, userEnrolledCourses } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/purchase', coursePurchase)

export default userRouter