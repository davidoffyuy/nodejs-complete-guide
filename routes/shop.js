const express = require('express');
const router = express.Router();

// Controller Imports
const shopController = require('../controllers/shop');

// Middleware
const isAuth = require('../middleware/is-auth');

router.get("/", shopController.getIndex);
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);
router.get('/checkout', isAuth, shopController.getCheckout);
router.post('/create-order', shopController.postOrder);
// router.get('/checkout', shopController.getCheckout);
router.get('/products', shopController.getProducts);
router.get('/product/:productId', shopController.getProduct);
router.get('/orders', isAuth, shopController.getOrders);
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
