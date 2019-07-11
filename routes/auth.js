const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../models/user');

// Import auth controller
const authController = require('../controllers/auth');

// Middleware
const isAuth = require('../middleware/is-auth');

// Define routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post('/signup',
  body('email').isEmail().withMessage('Enter a valid email address.').custom((value) => {
    return User.findOne({email: value})
    .then( userFound => {
      if (userFound) {
        return Promise.reject('Email already exists');
      }
    });
  }),
  body('password', 'Password does not meet the proper criteria.').isLength({min: 5}),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Confirm Password does not match.');
    }
    return true;
  }),
  authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;