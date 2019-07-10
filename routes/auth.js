const express = require('express');
const router = express.Router();

// Import auth controller
const authController = require('../controllers/auth');

// Middleware
const isAuth = require('../middleware/is-auth');

// Define routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;