const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('shop/index', {
      pageTitle: 'Shop',
      products: products,
      path: '/',
    })
  })
  .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('shop/product-list', {
      pageTitle: 'Shop',
      products: products,
      path: '/products',
    })
  })
  .catch(error => {console.log(error);});
};

exports.getProduct = (req, res, next) => {
  Product.findById(req.params.productId)
  .then(product => {
    res.render('shop/product-detail', {
      pageTitle: 'Product Detail',
      product: product,
      path: '/products',
    });
  })
  .catch(error => {console.log(error);})
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products: user.cart.items,
    });
  })
  .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
  .then(product => {
    req.user.addToCart(product)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user.deleteFromCart(productId)
  .then( result => res.redirect('/cart'))
  .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
  .then( orders => {
    console.log(orders);
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders: orders,
    })
  })
};

exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    const products = user.cart.items.map(i => {
      return {
        product: {...i.productId._doc},
        quantity: i.quantity
      }
    })

    const order = new Order({
      products: products,
      user: {
        email: req.user.email,
        userId: req.user
      }
    });
    return order.save();
  })
  .then(result => {
    return req.user.clearCart();
  })
  .then( ()  => {
    res.redirect('/orders');
  })
}

exports.getCheckout = (req, res, next) => {
  const products = Product.fetchAll(products => {
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout',
    })
  });
};