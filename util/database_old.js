const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://nodejsguide:nodejsguide@cluster0-xc044.mongodb.net/shop?retryWrites=true', { useNewUrlParser: true })
  .then(client => {
    console.log("connected to db");
    _db = client.db();
    callback();
  }).catch(error => {
    console.log(error);
  });
}

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;