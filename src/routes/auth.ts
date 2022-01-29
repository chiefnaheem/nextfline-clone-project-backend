import express from 'express';
const router = express.Router();
import { register, login, confirmEmail, logout, changePassword, forgotPassword, resetPassword } from '../controller/authContoller';
import protectRoute from '../middleware/authenticate';

router.route('/register').post(register)
router.route('/login').post(login);
router.route('/verify/:token').get(confirmEmail)
router.route('/logout').post(logout)
router.post('/changepassword', protectRoute, changePassword);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:token').post(resetPassword)

export default router;