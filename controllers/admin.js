const Product = require('../models/product');
const { validationResult } = require('express-validator');

const fileHelper = require('../util/file');

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
  .catch(error => next(error));
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
  const image = req.file;
  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: '/admin/add-product',
      edit: false,
      message: 'Image file not valid',
      error: '',
      product: { title: title,
        description: description,
        price: price}
    })       
  }
  
  const imageUrl = image.path.replace('\\', '/');

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: '/admin/add-product',
      edit: false,
      message: errors.array()[0].msg,
      error: errors.array()[0],
      product: { title: title,
        description: description,
        price: price}
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
  .catch(error => next(error));
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
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const image = req.file;
  const imageUrl = '';
  const productId = req.body.productId;

  const errors = validationResult(req);

  console.log(image);

  // if (!image) {
  //   return res.status(422).render("admin/edit-product", {
  //     pageTitle: "Add Product",
  //     path: '/admin/add-product',
  //     edit: false,
  //     message: 'Image file not valid',
  //     error: '',
  //     product: { title: title,
  //       description: description,
  //       price: price}
  //   })       
  // }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: '/admin/edit-product',
      product: {title: title, description: description, price: price, _id: productId},
      message: errors.array()[0].msg,
      error: errors.array()[0],
      edit: edit
    })
  }

  Product.findById(productId)
  .then( product => {
    if (product.userId.toString() !== req.user._id.toString())
      return res.redirect('/admin/products');
    product.title = title;
    product.description = description;
    product.price = price;
    if (image)
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path.replace('\\', '/');
    product.save()
    .then( result => {
      res.redirect("/admin/products");   
    })
    .catch(error => next(error));
  })
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
  .then( product => {
    if (!product) {
      return next(new Error('Product not found.'));
    }
    fileHelper.deleteFile(product.imageUrl);
    Product.deleteOne({_id: productId, userId: req.user._id})
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(error => next(error));
  })
  .catch(next(err));
}

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
  .then( product => {
    if (!product) {
      return next(new Error('Product not found.'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id: productId, userId: req.user._id});
  })
  .then(() => {
    res.status(200).json({
      "action": "delete",
      "object": "product",
      "completed": "success"
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      "action": "delete",
      "object": "product",
      "completed": "fail"
    });
  })
}