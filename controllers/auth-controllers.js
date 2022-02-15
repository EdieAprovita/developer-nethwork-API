const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const gravatar = require('gravatar');
const normalize = require('normalize-url');

const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth
// @access  Public

exports.registerUser = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	const userExists = await User.findOne({ email });

	if (userExists) {
		return res.status(400).json({
			success: false,
			error: 'Email already exists',
		});
	}

	// Create avatar from email
	const avatar = normalize(
		gravatar.url(email, {
			s: '200',
			r: 'pg',
			d: 'mm',
		}),
		{ forceHttps: true }
	);

	//Create User

	const user = await User.create({
		name,
		email,
		password,
		avatar,
	});

	if (user) {
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			success: true,
			token: generateToken(user._id),
		});
	} else {
		res.status(400).json({
			success: false,
			error: `Message: ${err.message}`,
		});
	}
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public

exports.loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	// Check for user

	const user = await User.findOne({ email });

	if (user && (await user.MatchPassword(password))) {
		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			success: true,
			token: generateToken(user._id),
		});
	} else {
		res.status(400).json({
			success: false,
			error: `Message: ${err.message}`,
		});
	}
});
