const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const Product = require('../models/product');
const Order = require('../models/order');

const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 3;

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProductCount = '';

  Product.countDocuments()
  .then( num => {
    totalProductCount = num;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then(products => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        products: products,
        path: '/',
        page: page,
        total: totalProductCount,
        show: ITEMS_PER_PAGE
      })
    });
  })
  .catch(err => next(err));


};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProductCount = '';

  Product.countDocuments()
  .then( num => {
    totalProductCount = num;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then(products => {
      res.render('shop/product-list', {
        pageTitle: 'Shop',
        products: products,
        path: '/products',
        page: page,
        total: totalProductCount,
        show: ITEMS_PER_PAGE
      })
    });
  })
  .catch(error => next(error));
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
  .catch(error => next(error));
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
  .catch(error => next(error));
};

exports.getCheckout = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    console.log(user.cart.items);
  
    const totalCost =  user.cart.items.reduce((acc, cur) => {
      return acc + (cur.productId.price * cur.quantity);
    }, 0);

    console.log(totalCost);

    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout',
      products: user.cart.items,
      totalCost: totalCost
    });    
  })
  .catch(error => next(error));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
  .then(product => {
    req.user.addToCart(product)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(error => next(error));
  })
  .catch(error => next(error));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user.deleteFromCart(productId)
  .then( result => res.redirect('/cart'))
  .catch(error => next(error));
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
  .catch(error => next(error));
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join(rootDir, 'data', 'invoices', invoiceName);
  console.log(invoicePath);

  Order.findOne({_id: orderId})
  .then(order => {
    if (!order) {
      return next(new Error('No order found.'));
    }
    if (order.user.userId.toString() !== req.session.user._id.toString()) {
      return next(new Error('User does not have access'));
    }
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err)
    //     return next(err);
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    //   res.send(data);
    // });

    // res.sendFile(invoicePath);

    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(24).text('Invoice', {underline: true});
    pdfDoc.text('-----------------------');

    let totalPrice = 0;

    order.products.forEach(prod => {
      pdfDoc.fontSize(16).text(prod.product.title + ' - ' + prod.quantity + ' x $' + prod.product.price);
      totalPrice += prod.product.price;
    });

    pdfDoc.text('-----------------------');
    pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

    pdfDoc.end();

  })
  .catch(error => next(error));
}