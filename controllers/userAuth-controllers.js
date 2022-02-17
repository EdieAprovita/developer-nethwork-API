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

	try {
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
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: '`Server Error ${error}`',
		});
	}
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public

exports.loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	try {
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
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @desc    Update user
// @route   PUT /api/user/:id
// @access  Private

exports.updateUser = asyncHandler(async (req, res) => {
	try {
		const user = await User.findById(req.user.__id);

		if (user) {
			user.name = req.body.name || user.name;
			user.email = req.body.email || user.email;

			if (req.body.password) {
				user.password = req.body.password;
			}

			const updateUser = await user.save();

			res.status(200).json({
				_id: updateUser._id,
				name: updateUser.name,
				email: updateUser.email,
				avatar: updateUser.avatar,
				success: true,
				token: generateToken(updateUser._id),
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});
