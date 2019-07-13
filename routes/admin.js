const express = require("express");
const path = require("path");

const { body } = require('express-validator');

// Controller Imports
const adminController = require('../controllers/admin');

const router = express.Router();

// Middleware Imports
const isAuth = require('../middleware/is-auth');

router.get("/add-product", adminController.getAddProduct);
router.post("/add-product", isAuth,
  isAuth,
  body('title').isString().isLength({min: 2, max: 50}),
  body('imageUrl').isURL().withMessage('Improper URL format'),
  body('price').isFloat(),
  body('description').isLength({min: 3, max: 100}),
  adminController.postAddProduct);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/edit-product/", isAuth,
  body('imageUrl').isURL().withMessage('Improper URL format'),
  adminController.postEditProduct);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);
router.get("/products", isAuth, adminController.getProducts);



module.exports = router;