const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true}, 
        quantity: {type: Number, required: true}
      }
    ]
  },
  resetToken: String,
  resetTokenExpiration: Date
});

userSchema.methods.addToCart = function(product) {
  const updatedCartItems = [...this.cart.items];
  let updatedQuantity = 1;

  // need to determine if product is already in cart.
  // if product is in cart already, then just need to 
  const productIndex = this.cart.items.findIndex(cp => {
    return cp.productId.equals(product._id);
  });
  if (productIndex >= 0) {
    updatedQuantity = updatedCartItems[productIndex].quantity + 1;
    updatedCartItems[productIndex].quantity = updatedQuantity;
  }
  else {
    updatedCartItems.push({productId: product._id, quantity: 1});
  }
  
  const updatedCart = {items: updatedCartItems};
  this.cart = updatedCart;
  return this.save();
}

userSchema.methods.deleteFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = {items: []};
  return this.save();
}

module.exports = mongoose.model('User', userSchema);