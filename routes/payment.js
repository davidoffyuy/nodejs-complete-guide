const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');
const paymentController = require ('../controllers/payment');

router.get('/checkout', isAuth, paymentController.getCheckout);
router.post('/checkout', isAuth, paymentController.postCheckout);

module.exports = router;