const Product = require('../models/product');
const { validationResult } = require('express-validator');

exports.getProducts = (req, res, next) => {
  // Page will only display products that user created. User cannot edit other user products.
  Product.find({userId: req.user._id})
  .then(products => {
    res.render("admin/products", {
      pageTitle: "Admin - Products",
      path: '/admin/products',
      prods: products,
    })
  })
  .catch(error => {console.log(error);})
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: '/admin/add-product',
    edit: false,
    message: '',
    error: '',
    product: null
  })
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: '/admin/add-product',
      edit: false,
      message: errors.array()[0].msg,
      error: errors.array()[0],
      product: { title: title,
        description: description,
        price: price,
        imageUrl: imageUrl }
    })    
  }

  const product = new Product({
    title: title,
    description: description,
    price: price,
    imageUrl: imageUrl,
    userId: req.user
  });
  product.save()
  .then(result => {
    res.redirect("/");
  })
  .catch(error => {
    res.redirect("/");
  });
};

exports.getEditProduct = (req, res, next) => {
  const edit = req.query.edit;
  const productId = req.params.productId;
  if (edit === "true" && productId) {
    Product.findById(productId).then(product => {
      if (product) {
        console.log(product);
        res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: '/admin/edit-product',
          product: product,
          message: '',
          error: '',
          edit: edit
        })
      }
      else {
        res.redirect("/");
      }
    })
  }
  else {
    return res.redirect("/");
  }
};

exports.postEditProduct = (req, res, next) => {
  title = req.body.title,
  description = req.body.description,
  price = req.body.price,
  imageUrl = req.body.imageUrl
  productId = req.body.productId

  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    return res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: '/admin/edit-product',
      product: {title: title, description: description, price: price, imageUrl: imageUrl, productId: productId},
      message: errors.array()[0].msg,
      error: errors.array()[0],
      edit: edit
    })
  }

  Product.findById(productId)
  .then( product => {
    if (product.userId.toString() !== req.user._id.toString())
      return res.redirect('/admin/products');
    product.title = title,
    product.description = description,
    product.price = price,
    product.imageUrl = imageUrl
    product.save()
    .then( result => {
      res.redirect("/admin/products");   
    })
    .catch( err => {
      console.log(err);
      res.redirect("/admin/products");
    });
  })
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.deleteOne({_id: req.body.productId, userId: req.user._id})
  .then(result => {
    res.redirect("/admin/products");
  })
  .catch(err => {
    console.log(err);
    res.redirect("/admin/products");
  });
}