"use strict";

require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const mongo = require('mongodb').MongoClient;
const routes = require('./routes');
const auth = require('./auth');

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

mongo.connect(process.env.DATABASE, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log('Database error: ' + err);
  } else {
    auth(app, client);
    routes(app, client);
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }
})

