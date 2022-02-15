const asyncHandler = require('express-async-handler');

const User = require('../models/User');
const Post = require('../models/Post');

// @route    POST api/posts
// @desc     Create a post
// @access   Private

exports.createPost = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select('-password');

	const newPost = await Post.create({
		text: req.body.text,
		name: user.name,
		avatar: user.avatar,
		user: req.user._id,
	});

	const post = await newPost.save();

	if (post) {
		res.status(201).json({
			success: true,
			data: post,
		});
	} else {
		res.status(400).json({
			success: false,
			error: 'Error creating post',
		});
	}
});

// @route    GET api/posts
// @desc     Get all posts
// @access   Private

exports.getAllPosts = asyncHandler(async (req, res) => {
	const posts = await Post.find().sort({ date: -1 });

	if (posts) {
		res.status(200).json({
			success: true,
			data: posts,
		});
	} else {
		res.status(400).json({
			success: false,
			error: 'Error getting posts',
		});
	}
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private

exports.getPostById = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (post) {
		res.status(200).json({
			success: true,
			data: post,
		});
	} else {
		res.status(400).json({
			success: false,
			error: 'Error getting post',
		});
	}
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private

exports.deletePost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (post) {
		await post.remove();

		res.status(200).json({
			success: true,
			data: {},
		});
	} else {
		res.status(400).json({
			success: false,
			error: 'Error deleting post',
		});
	}
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private

exports.likePost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (post) {
		if (post.likes.filter(like => like.user.toString() === req.user._id).length > 0) {
			return res.status(400).json({
				success: false,
				error: 'Post already liked',
			});
		}

		post.likes.unshift({ user: req.user._id });

		await post.save();

		res.status(200).json({
			success: true,
			data: post,
		});
	} else {
		res.status(400).json({
			success: false,
			error: 'Error liking post',
		});
	}
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private

exports.unlikePost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	//check if the post has already been liked
	if (!post.likes.filter(like => like.user.toString() === req.user._id).length > 0) {
		return res.status(400).json({
			success: false,
			error: 'Post has not yet been liked',
		});
	}

	//Remove like
	post.likes = post.likes.filter(like => like.user.toString() !== req.user._id);

	await post.save();

	if (post.likes) {
		res.status(200).json({
			success: true,
			data: post.likes,
		});
	} else {
		res.status(200).json({
			success: true,
			data: {},
		});
	}
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private

exports.commentPost = asyncHandler(async (req, res) => {
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

	if (post.comments) {
		res.status(200).json({
			success: true,
			data: post.comments,
		});
	} else {
		res.status(400).json({
			success: false,
			error: 'Error commenting on post',
		});
	}
});

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private

exports.deleteComment = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	//Pull out comment
	const comment = post.comment.find(comment => comment.id === req.params.comment_id);

	//Make sure comment exists
	if (!comment) {
		return res.status(404).json({ msg: 'Comment does not exist' });
	}

	post.comments = post.comments.filter(({ id }) => id !== req.params.comment._id);

	await post.save();

	if (post.comments) {
		res.status(200).json({
			success: true,
			data: post.comments,
		});
	} else {
		res.status(400).json({
			success: false,
			error: 'Error deleting comment',
		});
	}
});
