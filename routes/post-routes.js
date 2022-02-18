const router = require('express').Router();

const {
	createPost,
	getAllPosts,
	getPostById,
	deletePost,
	likePost,
	unlikePost,
	commentPost,
	deleteComment,
} = require('../controllers/post-controllers');

const protect = require('../middlewares/authMiddleware');

router.get('/posts',protect, getAllPosts);
router.get('/posts/:id',protect, getPostById);
router.post('/posts',protect, createPost);
router.post('/posts/comment/:id',protect, commentPost);
router.put('/posts/:id/like',protect, likePost);
router.put('/posts/:id/unlike',protect, unlikePost);
router.delete('/posts/:id/:comment_id',protect, deletePost);

module.exports = router;
