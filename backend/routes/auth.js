const express = require('express');
const router = express.Router();

const {
    signup,
    login,
    getUser,
    updateUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

const {verifyToken} =  require('../middleware/authMiddleware');

//public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

//protected routes
router.get('/user', verifyToken, getUser);
router.put('/user', verifyToken, updateUser);

module.exports = router;
