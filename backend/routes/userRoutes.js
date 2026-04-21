const express = require('express');
const { registerUser, authUser, allUsers, updateProfilePic } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers);
router.post('/login', authUser);
router.put('/profile-pic', protect, updateProfilePic);

module.exports = router;
