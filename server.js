"use strict";

require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const LocalStrategy = require('passport-local');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

app.route("/").get((req, res) => {
  //Change the response to render the Pug template
  res.render('pug/index',
  {
    title: 'Hello',
    message: 'Please login',
    showLogin: true
  });
});

app.route('/login').post(
  passport.authenticate('local', {failureRedirect: '/'}),
  (req, res) => {
    res.redirect('/profile');
  });

app.route('/profile').get(ensureAuthenticated, (req, res) => {
  res.render('pug/profile', {username:req.user.username});
})

mongo.connect(process.env.DATABASE, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log('Database error: ' + err);
  } else {
    passport.serializeUser((user, done) => {
      done(null, user._id);
    })
    passport.deserializeUser((id, done) => {
      client.db().collection('users').findOne(
      {_id: new ObjectID(id)},
        (err, doc) => {
          done(null, doc);
        }
      );
    })
    passport.use(new LocalStrategy(
      function(username, password, done) {
        client.db().collection('users').findOne({username: username}, function(err, user) {
          console.log('User ' + username + ' attempted to log in.');
          if (err) { return done(err);}
          if (!user) { return done(null, false);}
          if (password !== user.password) { return done(null, false);}
          return done(null, user);
        });
      }
    ))
    
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }
})

