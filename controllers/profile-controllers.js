const normalize = require('normalize-url');

const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private

exports.getUserProfile = asyncHandler(async (req, res) => {
	const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
		'name',
		'avatar',
	]);

	if (profile) {
		res.status(200).json({ profile });
	} else {
		res.status(400).json({ msg: 'There is no profile for this user' });
	}
});

// @route    POST api/profile
// @desc     Create a user profile
// @access   Private

exports.createNewProfile = asyncHandler(async (req, res) => {
	const profileExists = await Profile.findOne({ user: req.user.id });

	if (profileExists) {
		return res.status(400).json({ msg: 'Profile already exists' });
	}

	const {
		website,
		skills,
		youtube,
		twitter,
		instagram,
		linkedin,
		facebook,
		//Spread the rest of the fields
		...rest
	} = req.body;

	// Build profile object
	const profileFields = {
		user: req.user.id,
		website:
			website && website !== '' ? normalize(website, { forceHttps: true }) : '',
		skills: skills ? skills.split(',').map(skill => ' ' + skill.trim()) : [],
		...rest,
	};

	// Build socialFields object

	const socialFields = { youtube, twitter, instagram, linkedin, facebook };

	//Normalize the social fields
	for (const [key, value] of Object.entries(socialFields)) {
		if (value && value.length > 0) {
			socialFields[key] = normalize(value, { forceHttps: true });
		}

		//Add the social fields to the profileFields
		profileFields.social = socialFields;
	}

	// Create profile
	const newProfile = await Profile.create({
		...profileFields,
	});

	if (newProfile) {
		res.status(201).json({
			_id: user._id,
			profile: newProfile,
		});
	} else {
		res.status(400).json({ msg: `Error: ${err.message}` });
	}
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private

exports.updateUserProfile = asyncHandler(async (req, res) => {
	const profile = await Profile.findOne({ user: req.user.id });

	if (!profile) {
		return res.status(400).json({ msg: 'Profile does not exist' });
	}

	const {
		website,
		skills,
		youtube,
		twitter,
		instagram,
		linkedin,
		facebook,
		//Spread the rest of the fields
		...rest
	} = req.body;

	// Build profile object
	const profileFields = {
		user: req.user.id,
		website:
			website && website !== '' ? normalize(website, { forceHttps: true }) : '',
		skills: skills ? skills.split(',').map(skill => ' ' + skill.trim()) : [],
		...rest,
	};

	// Build socialFields object

	const socialFields = { youtube, twitter, instagram, linkedin, facebook };

	//Normalize the social fields
	for (const [key, value] of Object.entries(socialFields)) {
		if (value && value.length > 0) {
			socialFields[key] = normalize(value, { forceHttps: true });
		}

		//Add the social fields to the profileFields
		profileFields.social = socialFields;
	}

	// Update profile
	const updatedProfile = await Profile.findOneAndUpdate(
		{ user: req.user.id },
		{ $set: profileFields },
		{ new: true, upsert: true, setDefaultsOnInsert: true }
	);

	if (updatedProfile) {
		res.status(200).json({
			_id: user._id,
			profile: updatedProfile,
		});
	} else {
		res.status(400).json({ msg: `Error: ${err.message}` });
	}
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public

exports.getAllProfiles = asyncHandler(async (req, res) => {
	const profiles = await Profile.find().populate('user', ['name', 'avatar']);

	if (profiles) {
		return res.status(200).json(profiles);
	} else {
		return res.status(400).json({ msg: 'There are no profiles' });
	}
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public

exports.getUserProfileById = asyncHandler(async (req, res) => {
	const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
		'name',
		'avatar',
	]);

	if (profile) {
		return res.status(200).json(profile);
	} else {
		return res.status(400).json({ msg: 'There is no profile for this user' });
	}
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private

exports.deleteUser = asyncHandler(async (req, res) => {
	try {
		await Promise.all([
			Profile.findOneAndRemove({ user: req.user.id }),
			User.findOneAndRemove({ _id: req.user.id }),
			Post.deleteMany({ user: req.user.id }),
		]);

		res.status(200).json({ msg: 'User deleted' });
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});
