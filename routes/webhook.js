const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const {secret, endpointSecret } = require('../private/stripe-key');

// Mongoose Models
const User = require('../models/user');
const Order = require('../models/order');

const stripe = require('stripe')(secret);

// Match the raw body to content type application/json
router.post('/', bodyParser.raw({type: 'application/json'}), (request, response) => {
  console.log("WEBHOOK INITIATED");
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    // Fulfill the purchase...
    // handleCheckoutSession(session);
    console.log("WEBHOOK RECEIVED!");
    handleSaveOrder(event);

  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});

const handleSaveOrder = event => {
  const userId = event.data.object.client_reference_id;
  console.log(userId);

  User.findById(userId)
  .then(user => {
    user.populate('cart.items.productId')
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
          email: user.email,
          userId: user
        },
        stripeEvent: event
      });
      return order.save();
    })
    .then(result => {
      return user.clearCart();
    })
    .catch(error => console.log(error));
  })
};

module.exports = router;