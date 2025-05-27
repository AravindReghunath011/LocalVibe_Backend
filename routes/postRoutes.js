import express from 'express';
import { add_comment, create_post, dislike_post, get_post_by_id, get_posts, like_post } from '../controllers/postController.js';
import protect from '../middlewares/auth.js';


const router = express.Router();

router.post('/', get_posts);
router.post('/create', protect, create_post);
router.post('/new_comment', protect, add_comment);
router.post('/like', protect, like_post);
router.post('/dislike', protect, dislike_post);
router.post('/id', get_post_by_id);


export default router; 
