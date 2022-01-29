import express from 'express';
import { createList, deleteList, getByQuery } from '../controller/listContoller';
import protectRoute from '../middleware/authenticate';
const router = express.Router();

router.get('/random', protectRoute, getByQuery)
router.post('/', protectRoute, createList)
router.delete('/delete/:id', protectRoute, deleteList)


export default router;