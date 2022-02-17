const asyncHandler = require('express-async-handler');

const User = require('../models/User');
const Post = require('../models/Post');

// @route    POST api/posts
// @desc     Create a post
// @access   Private

exports.createPost = asyncHandler(async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');

		const newPost = await Post.create({
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user._id,
		});

		const post = await newPost.save();

		res.status(201).json({
			success: true,
			data: post,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    GET api/posts
// @desc     Get all posts
// @access   Private

exports.getAllPosts = asyncHandler(async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.status(200).json({
			success: true,
			data: posts,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private

exports.getPostById = asyncHandler(async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({
				msg: 'Post not Found',
			});
		}

		res.status(200).json({
			success: true,
			data: post,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private

exports.deletePost = asyncHandler(async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({
				msg: 'Post not Found',
			});
		}

		await post.remove();

		res.status(200).json({
			success: true,
			msg: 'Post deleted',
			data: {},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private

exports.likePost = asyncHandler(async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// Check if the post has already been liked
		if (post.likes.some(like => like.user.toString() === req.user.id)) {
			return res.status(400).json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: req.user.id });

		await post.save();

		res.json(200).json({
			success: true,
			data: post,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private

exports.unlikePost = asyncHandler(async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// Check if the post has not yet been liked
		if (!post.likes.some(like => like.user.toString() === req.user.id)) {
			return res.status(400).json({ msg: 'Post has not yet been liked' });
		}

		// remove the like
		post.likes = post.likes.filter(({ user }) => user.toString() !== req.user.id);

		await post.save();

		res.status(201).json({
			success: true,
			data: post.likes,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private

exports.commentPost = asyncHandler(async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');
		const post = await Post.findById(req.params.id);

		const newComment = {
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user._id,
		};

		post.comments.unshift(newComment);

		await post.save();

		res.status(200).json({
			success: true,
			data: post.comments,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private

exports.deleteComment = asyncHandler(async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//Pull out comment
		const comment = post.comment.find(
			comment => comment.id === req.params.comment_id
		);

		//Make sure comment exists
		if (!comment) {
			return res.status(404).json({ msg: 'Comment does not exist' });
		}

		post.comments = post.comments.filter(({ id }) => id !== req.params.comment._id);

		await post.save();

		res.status(200).json({
			success: true,
			data: post.comments,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});
