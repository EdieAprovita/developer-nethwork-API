import express from 'express';
const router = express.Router();

import {
	registerUser,
	loginUser,
	updateUser,
} from '../controllers/userAuth-controllers.js';

import protect from '../middlewares/authMiddleware.js';

//User Auth Routes

router.get('/signup', registerUser);
router.post('/login', loginUser);
router.put('/update', protect, updateUser);

export default router;
