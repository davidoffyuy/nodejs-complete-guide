const User = require('../models/user');
const bcrypt = require('bcryptjs');

const crypto = require('crypto'); // used to generate password reset token

const { validationResult } = require('express-validator');

// Setting up nodemailer transport
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const sgTransportSettings = require('../private/sendgrid-transport-settings');

const transporter = nodemailer.createTransport(sgTransport(sgTransportSettings));

exports.getLogin = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }

  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    message: message,
    oldInput: {email: '', password: ''},
    error: ''
  });
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      message: errors.array()[0].msg,
      error: errors.array()[0],
      oldInput: {email: email, password: ''}
    });
  }

  User.findOne({email: email})
  .then(user => {
    if (!user) {
      return res.status(422).render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        message: 'Incorrect Email or Password',
        error: '',
        oldInput: {email: email, password: ''}
      });
    }

    bcrypt.compare(password, user.password)
    .then( isMatch => {
      if (isMatch) {
        req.session.user = user;
        return req.session.save(err => {
          console.log(err);
          res.redirect('/');
        });
      }
      return res.status(422).render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        message: 'Incorrect Email or Password',
        error: '',
        oldInput: {email: email, password: ''}
      });
    })
    .catch(err => console.log(err));
  })
  .catch(error => next(error));
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuth: false,
    message: message,
    error: '',
    oldInput: {email: '', password: '', confirmPassword: ''}
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.password;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuth: false,
      message: errors.array()[0].msg,
      error: errors.array()[0],
      oldInput: {email: email, password: '', confirmPassword: ''}
    });
  }
  else {
    return bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const newUser = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      })
      return newUser.save();
    })
    .then( result => {
      return transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Signup successful',
        html: "<h1>You've successfully signed up at node-complete-shop</h1>"
      });
    })
    .then( result => {
      res.redirect('/login');
    })
    .catch( err => console.log(err));
  }
}

exports.getReset = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0)
    message = message[0];
  else
    message = null;

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset password',
    isAuth: false,
    message: message
  });
}

exports.postReset = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    User.findOne({email: email})
    .then( user => {
      // If email not found
      if (!user) { 
        req.flash('message', 'Email was not found.');
        return req.session.save(err => {
          res.redirect('/reset');
        });
      }
      // If email is found, gerate token, save to session, redirect
      user.resetToken = buffer.toString('hex');
      user.resetTokenExpiration = Date.now() + 3600000;
      user.save()
      .then( err => {
        console.log(err);
        res.redirect('/');

        return transporter.sendMail({
          to: email,
          from: 'shop@node-complete.com',
          subject: 'Reset Password',
          html: `
            <p>Click the following link to reset your password</p>
            <p><a href="http://localhost:3000/reset/${user.resetToken}">RESET PASSWORD LINK</a><p>
          `
        });
      });
    })
    .catch(error => next(error));
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
  .then( user => {
    if (!user) {
      return res.redirect('/');
    }

    res.render('auth/new-password', {
      path: '/reset',
      pageTitle: 'Set New Password',
      isAuth: false,
      userId: user._id.toString(),
      resetToken: token
    });
  })
  .catch(error => next(error));
}

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const resetToken = req.body.resetToken;

  User.findOne({
    resetToken: resetToken,
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
  .then( user => {
    if (!user) {
      return res.redirect('/');
    }

    bcrypt.hash(newPassword, 12, (err, hashedPassword) => {
      console.log(err);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      return user.save()
      .then( result => {
        res.redirect('/login');
      });
    })
  })
  .catch(error => next(error));
}