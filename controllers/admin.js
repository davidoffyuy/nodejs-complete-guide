const Product = require('../models/product');

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
  })
};

exports.postAddProduct = (req, res, next) => {
  const product = new Product({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
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
        res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: '/admin/edit-product',
          product: product,
          edit: edit,
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
  Product.findById(req.body.productId)
  .then( product => {
    if (product.userId.toString() !== req.user._id.toString())
      return res.redirect('/admin/products');
    product.title = req.body.title,
    product.description = req.body.description,
    product.price = req.body.price,
    product.imageUrl = req.body.imageUrl
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