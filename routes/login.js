const express = require("express");
const login = express.Router();
const bcrypt = require("bcrypt"); // serve nel login per controllare che la psw messa corrisponda
const UserModel = require("../models/author");
const jwt = require("jsonwebtoken");
require("dotenv").config();

login.post("/login", async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email }); //recupera l'utente che fa il login tramite la sua email

  if (!user) {
    return res.status(404).send({ statusCode: 404, message: "User NOT FOUND" });
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password); //controlla la validità della psw.

  if (!validPassword) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email o password errati",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  res.header("Authorization", token).status(200).send({
    message: "Login effettuato con successo",
    statusCode: 200,
    token,
  });
});

module.exports = login;
