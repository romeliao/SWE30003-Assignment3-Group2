const express = require('express');
const router = express.Router();

const {
    signup,
    login,
    getUser,
    updateUser,
} = require('../controllers/authController');

const {verifyToken} =  require('../middleware/authMiddleware');

//public routes
router.post('/signup', signup);
router.post('/login', login);

//protected routes
router.get('/user', verifyToken, getUser);
router.put('/user', verifyToken, updateUser);

module.exports = router;
