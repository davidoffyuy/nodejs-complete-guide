const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Product', productSchema);

// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// class Product {
//   constructor(title, description, price, imageUrl, id, userId) {
//     this.title = title;
//     this.description = description;
//     this.price = price;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbResult;
//     if (this._id) {
//       dbResult = db.collection("products").updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbResult = db.collection("products").insertOne(this);
//     }

//     return dbResult
//       .then(result => {
//         console.log(result);
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then(products => {
//         return products;
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   }

//   static findById(id) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(id) })
//       .next();
//   }

//   static deleteById(id) {
//     const db = getDb();
//     return db.collection('products').deleteOne({_id: new mongodb.ObjectId(id)})
//     .then(result => console.log("deleted"))
//     .catch(err => console.log(err));
//   }
// }

// module.exports = Product;
