const router = require('express').Router();

const {
	registerUser,
	loginUser,
	updateUser,
} = require('../controllers/userAuth-controllers');

const protect = require('../middlewares/authMiddleware');

//User Auth Routes

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.put('/update', protect, updateUser);

module.exports = router;
