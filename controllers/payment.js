const {secret, public} = require('../private/stripe-key');
const stripe = require('stripe')(secret);

exports.getCheckout = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {

    let line_items = [];
    user.cart.items.forEach(item => {
      line_items.push({
        name: item.productId.title,
        description: item.productId.description,
        amount: item.productId.price * 100,
        quantity: item.quantity,
        currency: 'usd'
      });
    });
    
    console.log(line_items);

    (async () => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        success_url: 'http://localhost:3000/orders',
        cancel_url: 'http://localhost:3000/orders',
      });

      const totalCost =  user.cart.items.reduce((acc, cur) => {
        return acc + (cur.productId.price * cur.quantity);
      }, 0);

      res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        products: user.cart.items,
        totalCost: totalCost,
        sessionId: session.id,
        publicKey: public,
        csrfToken: ''
      });
    })();
  })
  .catch(error => next(error));
};

exports.postCheckout = (req, res, next) => {
  console.log(req.body.testField);
  console.log("postCheckout");
}