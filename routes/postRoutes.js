import express from 'express';
import { add_comment, create_post, get_posts } from '../controllers/postController.js';
import protect from '../middlewares/auth.js';


const router = express.Router();

router.get('/', protect, get_posts);
router.post('/create', protect, create_post);
router.post('/new_comment', protect, add_comment);


export default router;
