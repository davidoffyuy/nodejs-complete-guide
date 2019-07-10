const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const path = require('path');
const rootDir = require('./util/path');
const User = require('./models/user');
const csrf = require('csurf');
const flash = require('connect-flash');

const mongoose = require('mongoose');
const MongoDbStore = require('connect-mongodb-session')(session);
const MONGODB_URI = 'mongodb+srv://nodejsguide:nodejsguide@cluster0-xc044.mongodb.net/shop';

//Routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require('./routes/auth');

//Declare Express
const app = express();

//Constructing MongoDb Store for session storage
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'session'
});

// CSRF prevention
const csrfProtection = csrf();

// Controller Imports
const errorController = require('./controllers/error');

app.set('view engine', 'ejs');
app.set('views', 'views'); //set views folder to /views

//make sure the browser doesn't check for a favicon upon load
app.get("/favicon.ico", (req, res) => res.status(204));

app.use(bodyParser.urlencoded({ extended: true }));

// Make public folder accessible by views
app.use(express.static(path.join(rootDir, 'public')));

app.use(session({secret: 'home is where the heart is', resave: false, saveUninitialized: false, store: store}));

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    req.user = user;
    next();
  })
})

// Add csrf protetion middleware via csurf
app.use(csrfProtection);

// Setting local data to be available for all renders
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.isAuth = req.session.user ? true : false;
  next();
})

// Setting up flash messaging
app.use(flash());

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.error404);

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
.then(result => {
  app.listen(3000);
});