const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const productsPath = path.join(rootDir, 'data', 'products.json');
const Cart = require('../model/cart');

const getProductFromFile = callback  => {
  fs.readFile(productsPath, (err, fileContent) => {
    if (!err) {
      return callback(JSON.parse(fileContent));
    }
    else {
      return callback([]);
    }
  });
}

module.exports = class Products {
  constructor(id, title, description, price, imageUrl) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductFromFile(products => {
      // if ID exists, overwrite existing product. Else, create new product and save
      if (this.id) {
        const prodIndex = products.findIndex(p => p.id === this.id);
        if (prodIndex >= 0) {
          const updatedProducts = [...products]
          updatedProducts[prodIndex] = this;
          fs.writeFile(productsPath, JSON.stringify(updatedProducts), err => {console.log(err);});
        }
      }
      else {
        this.id = Math.floor(Math.random() * 1000000).toString();
        products.push(this);
        fs.writeFile(productsPath, JSON.stringify(products), err => { console.log(err);});
      }
    });
  }

  static delete(productId) {
    if (productId) {
      getProductFromFile(products => {
        let updatedProducts = products.filter(p => p.id !== productId);
        fs.writeFile(productsPath, JSON.stringify(updatedProducts), err => {console.log(err);});

        // NEED TO REMOVE PRODUCT FORM THE CART AFTER DELETING
        const prodPrice = products.find(p => p.id === productId).price;
        Cart.deleteProduct(productId, prodPrice);
      });
    }
  }

  static fetchAll(callback) {
    getProductFromFile(callback);
  }

  static findById(id, callback) {
    getProductFromFile(products => {
      const product = products.find(p => p.id === id);
      callback(product);
    });
  }
}