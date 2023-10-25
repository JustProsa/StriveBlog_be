// npm i passport passport-github2 express-session

const express = require("express");
const gh = express.Router();
const passport = require("passport");
const GithubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");
const session = require("express-session");
require("dotenv").config();

gh.use(
  session({
    secret: process.env.GITHUB_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

gh.use(passport.initialize());
gh.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("PROFILE:", profile);
      return done(null, profile);
    }
  )
);

gh.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["author:email"] }),
  (req, res) => {
    const redirectUrl = `http://localhost:3000/success?author=${encodeURIComponent(
      JSON.stringify(req.author) //user o author?
    )}`;
    res.redirect(redirectUrl);
  }
);

gh.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;
    console.log("LOG USER:", user);
    const token = jwt.sign(user, process.env.JWT_SECRET);
    const redirectUrl = `http://localhost:3000/success/${encodeURIComponent(
      token
    )}`;
    res.redirect(redirectUrl);
  }
);

gh.get("/success", (req, res) => {
  res.redirect("http://localhost:3000/home");
});

module.exports = gh;
