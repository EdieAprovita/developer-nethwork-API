const router = require('express').Router();

const {
	getUserProfile,
	getAllProfiles,
	getProfileById,
	createNewProfile,
	updateUserProfile,
	deleteUser,
} = require('../controllers/profile-controllers');

const protect = require('../middlewares/authMiddleware');

//Profile Routes

router.get('/me', protect, getUserProfile);
router.get('/', getAllProfiles);
router.get('/:id', getProfileById);
router.post('/newProfile', protect, createNewProfile);
router.put('/updateProfile', protect, updateUserProfile);
router.delete('/deleteProfile', protect, deleteUser);

module.exports = router;