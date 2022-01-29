import express from 'express';
import { grantAccess } from '../middleware/permission';
import { getAllUsers, updateOneUser, suspendUser, getSelfProfile, adminGetOneUser, userGetUser, reactivateUser, blockUser, getStats } from '../controller/userController';
import protectRoute from '../middleware/authenticate';
const router = express.Router();


router.get('/', protectRoute, getAllUsers)
router.get('/self', protectRoute, getSelfProfile)
router.get('/user/:id', protectRoute, userGetUser)
router.get('/admingetuser/:id',protectRoute, adminGetOneUser)
router.patch('/updateuser/:id', protectRoute, updateOneUser);
router.patch('/suspenduser/:id', protectRoute, suspendUser);
router.patch('/activateuser/:id', protectRoute, reactivateUser);
router.patch('/blockuser/:id', protectRoute, blockUser)
router.get('/stats', protectRoute, getStats)

export default router;