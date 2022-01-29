import express from 'express';
import protectRoute from '../middleware/authenticate';
import { postMovie, getMovie, getRandomMovie, updateMovie, deleteMovie, getAllMovies} from '../controller/movieController';
const router = express.Router();

router.post('/', protectRoute, postMovie);
router.get('/find/:id', protectRoute, getMovie)
router.get('/random', protectRoute, getRandomMovie)
router.get('/all', protectRoute, getAllMovies)
router.patch('/edit/:id', protectRoute, updateMovie)
router.delete('/remove/:id', protectRoute, deleteMovie)

export default router;