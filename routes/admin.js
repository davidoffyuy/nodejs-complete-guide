const express = require("express");
const path = require("path");

// Controller Imports
const adminController = require('../controllers/admin');

const router = express.Router();

// Middleware Imports
const isAuth = require('../middleware/is-auth');

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", isAuth, adminController.postAddProduct);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/edit-product/", isAuth, adminController.postEditProduct);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);
router.get("/products", isAuth, adminController.getProducts);



module.exports = router;