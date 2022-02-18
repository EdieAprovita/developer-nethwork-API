const normalize = require('normalize-url');
const asyncHandler = require('express-async-handler');
const axios = require('axios');

const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private

exports.getUserProfile = asyncHandler(async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user._id }).populate('user', [
			'name',
			'avatar',
		]);

		if (!profile) {
			return res.status(400).json({
				success: false,
				error: 'Profile not found',
			});
		}

		res.status(200).json({
			success: true,
			data: profile,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    POST api/profile
// @desc     Create a user profile
// @access   Private

exports.createNewProfile = asyncHandler(async (req, res) => {
	try {
		const profileExists = await Profile.findOne({ user: req.user._id });

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
			user: req.user._id,
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
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private

exports.updateUserProfile = asyncHandler(async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user._id });

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
			user: req.user._id,
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
			{ user: req.user._id },
			{ $set: profileFields },
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		);

		if (updatedProfile) {
			res.status(200).json({
				_id: user._id,
				profile: updatedProfile,
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public

exports.getAllProfiles = asyncHandler(async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.status(200).json({
			success: true,
			data: profiles,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public

exports.getProfileById = asyncHandler(async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.user_id }).populate(
			'user',
			['name', 'avatar']
		);
		res.status(200).json({
			success: true,
			data: profile,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private

exports.deleteUser = asyncHandler(async (req, res) => {
	try {
		await Promise.all([
			Profile.findOneAndRemove({ user: req.user._id }),
			User.findOneAndRemove({ _id: req.user._id }),
			Post.deleteMany({ user: req.user._id }),
		]);

		res.status(200).json({ msg: 'User deleted' });
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private

exports.updateExperience = asyncHandler(async (req, res) => {
	const profile = await Profile.findOne({ user: req.user._id });

	profile.experience.unshift(req.body);

	await profile.save();

	if (profile) {
		return res.status(200).json(profile);
	} else {
		return res.status(400).json({ msg: 'There is no profile for this user' });
	}
});

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

exports.deleteExperience = asyncHandler(async (req, res) => {
	const foundProfile = await Profile.findOne({ user: req.user._id });

	if (foundProfile) {
		foundProfile.experience = foundProfile.experience.filter(
			exp => exp._id.toString() !== req.params.exp_id
		);
		await foundProfile.save();
		return res.status(200).json(foundProfile);
	} else {
		return res.status(400).json({ msg: 'There is no profile for this user' });
	}
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private

exports.addProfileEducation = asyncHandler(async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user._id });

		if (!profile) {
			res.status(200).json({ msg: 'Profile does not exist' });
		}

		profile.education.unshift(req.body);

		await profile.save();

		res.status(200).json({
			success: true,
			data: profile,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

exports.deleteProfileEducation = asyncHandler(async (req, res) => {
	try {
		const foundProfile = await Profile.findOne({ user: req.user._id });

		if (!foundProfile) {
			return res.status(400).json({ msg: 'Profile does not exist' });
		}

		foundProfile.education = foundProfile.education.filter(
			edu => edu._id.toString() !== req.params.edu_id
		);

		await foundProfile.save();

		res.status(200).json({
			success: true,
			data: foundProfile,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public

exports.getGithubRepos = asyncHandler(async (req, res) => {
	try {
		const url = encodeURI(
			`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
		);

		const headers = {
			'user-agent': 'node.js',
			Authorization: `token ${config.get('githubToken')}`,
		};

		const gitHubResponse = await axios.get(url, { headers });

		res.status(200).json({
			success: true,
			data: gitHubResponse.data,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: `Server Error ${error}`,
		});
	}
});
