import express from 'express';
const router = express.Router();

import {
	createPost,
	getAllPosts,
	getPostById,
	deletePost,
	likePost,
	unlikePost,
	commentPost,
	deleteComment,
} from '../controllers/post-controllers.js';

import protect from '../middlewares/authMiddleware.js';

router.get('/posts', protect, getAllPosts);
router.get('/posts/:id', protect, getPostById);
router.post('/posts', protect, createPost);
router.post('/posts/comment/:id', protect, commentPost);
router.put('/posts/:id/like', protect, likePost);
router.put('/posts/:id/unlike', protect, unlikePost);
router.delete('/posts/:id/:comment_id', protect, deletePost);
router.delete('/posts/:id/comment/:comment_id', protect, deleteComment);

export default router;
