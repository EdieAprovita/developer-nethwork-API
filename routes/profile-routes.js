import express from 'express';
const router = express.Router();

import {
	getUserProfile,
	getAllProfiles,
	getProfileById,
	createNewProfile,
	updateUserProfile,
	updateExperience,
	addProfileEducation,
	deleteExperience,
	deleteProfileEducation,
	getGithubRepos,
	deleteUser,
} from '../controllers/profile-controllers.js';

import protect from '../middlewares/authMiddleware.js';

//Profile Routes

router.get('/me', protect, getUserProfile);
router.get('/', getAllProfiles);
router.get('/:id', getProfileById);
router.get('/github/:username', getGithubRepos);
router.post('/newProfile', protect, createNewProfile);
router.put('/updateProfile', protect, updateUserProfile);
router.put('/updateExperience', protect, updateExperience);
router.put('/addProfileEducation', protect, addProfileEducation);
router.delete('/deleteExperience/:exp_id', protect, deleteExperience);
router.delete('/deleteEducation/:edu_id', protect, deleteProfileEducation);
router.delete('/deleteProfile', protect, deleteUser);

export default router;
