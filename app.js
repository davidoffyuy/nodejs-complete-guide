const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
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

// Parser for POST text data
app.use(bodyParser.urlencoded({ extended: true }));

// Parser for image files
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimeType === 'image/jpeg' || file.mimeType === 'image/jpg')
    cb(null, true);
  else
    cb(null, false);
}

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

// Make public folder accessible by views
app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));

app.use(session({secret: 'home is where the heart is', resave: false, saveUninitialized: false, store: store}));

// Add csrf protetion middleware via csurf
app.use(csrfProtection);

// Setting local data to be available for all renders
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.isAuth = req.session.user ? true : false;
  next();
})

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    if (!user) {
      next();
    }
    req.user = user;
    next();
  })
  .catch(err => {
    next(err);
  })
})

// Setting up flash messaging
app.use(flash());

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.error500);

app.use(errorController.error404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render('500', {pageTitle: 'Error Occurred', path: '/500', isAuth: false});
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
.then(result => {
  app.listen(3000);
});