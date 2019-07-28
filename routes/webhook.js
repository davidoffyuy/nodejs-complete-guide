const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const {secret, endpointSecret } = require('../private/stripe-key');

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
    const session = event.data.object;

    // Fulfill the purchase...
    // handleCheckoutSession(session);
    console.log("WEBHOOK RECEIVED!")
    console.log(session);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});

module.exports = router;