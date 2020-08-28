"use strict";

require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const { Db } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;

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

passport.serializeUser((user, done) => {
  done(null, user._id);
})
passport.deserializeUser((id, done) => {
  //db.collection('users').findOne(
  //{_id: new ObjectID(id)},
  //  (err, doc) => {
  //    done(null, doc);
  //  }
  //);
  done(null, null);
})


app.route("/").get((req, res) => {
  //Change the response to render the Pug template
  res.render('pug/index',
  {
    title: 'Hello',
    message: 'Please login'
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
