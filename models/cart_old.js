const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const cartPath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {

  static addProduct(id, price) {
    console.log("addProduct");
    // get existing items in cart
    fs.readFile(cartPath, (err, fileContent) => {
      console.log(err)
      let myCart;
      let oldProd;
      let oldProds;
      let newProd;
      let newCartProds;
      let newPrice;
      if (!err) {
        myCart = JSON.parse(fileContent);

        // find if product already exists in the cart
        let prodIndex;
        if (myCart.products)
          prodIndex = myCart.products.findIndex(prod => prod.id === id);

        // if product exists, copy product and increment qty by 1
        // else, just create a new object with id and set qty to 1
        if (prodIndex >= 0) {
          newProd = {...myCart.products[prodIndex]};
          newProd.qty += 1;
          newCartProds = [...myCart.products];
          newCartProds[prodIndex] = newProd;
          newPrice = myCart.price + +price;
        }
        else if (myCart.products) {
          newCartProds = [...myCart.products, {id: id, qty: 1}];
          newPrice = myCart.price + +price;
        }
        else {
          newCartProds = [{id: id, qty: 1}];
          newPrice = +price;

        }

      // increment price first, because it's easy
      myCart = {products: newCartProds, price: newPrice};
      console.log(JSON.stringify(myCart));
      fs.writeFile(cartPath, JSON.stringify(myCart), err => {console.log(err);})
      }
      else {
        fs.writeFile(cartPath, JSON.stringify({products: [id], price: price}), err => {console.log(err)})
      }
    });
  }

  static deleteProduct(id, price) {
    fs.readFile(cartPath, (err, fileContent) => {
      if (err) {
        return;
      }
      const myCart = JSON.parse(fileContent);
      const prodIndex = myCart.products.findIndex(p => p.id === id);
      console.log(prodIndex);
      console.log(id);
      console.log(myCart.products);
      if (prodIndex >= 0) {
        const delQty = myCart.products[prodIndex].qty;
        const updatedProducts =  myCart.products.filter(p => p.id !== id);
        const updatedCart = {products: updatedProducts, price: myCart.price - (price * delQty)};
        fs.writeFile(cartPath, JSON.stringify(updatedCart), err => {console.log(err);});
      };
    })
  }

  static getProducts(callback) {
    fs.readFile(cartPath, (err, fileContent) => {
      if (err) {
        return console.log(err);
      }
      else {
        return callback(JSON.parse(fileContent));
      }
    });
  }
}