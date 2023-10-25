const express = require("express");
const authors = express.Router();
const logger = require("../middlewares/logger");
const bcrypt = require("bcrypt");

const AuthorModel = require("../models/author");

authors.get("/authors", logger, async (req, res) => {
  const { page = 1, pageSize = 3 } = req.query;
  try {
    const authors = await AuthorModel.find()
      .limit(pageSize)
      .skip((page - 1) * pageSize);
    const totalAuthors = await AuthorModel.count();

    res.status(200).send({
      statusCode: 200,
      currentPage: Number(page),
      totalAuthors,
      authors,
    });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: `Internal server error: ${error}` });
  }
});

authors.get("/authors/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const author = await AuthorModel.findById(id);

    if (!author) {
      res.status(404).send({ statusCode: 404, message: "Author not FOUND!" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: `Internal server error: ${error}` });
  }
});

authors.post("/authors/create", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const newAuthor = new AuthorModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    birthDay: req.body.birthDay,
    avatar: req.body.avatar,
    password: hashedPassword,
  });

  try {
    const author = await newAuthor.save();

    return res.status(201).send({
      statusCode: 201,
      message: "Author created successfully",
      payload: author,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ statusCode: 500, message: "Internal server error", error });
  }
});

authors.patch("/authors/:id", async (req, res) => {});

authors.delete("/authors/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const author = await AuthorModel.findByIdAndDelete(id);
    if (!author) {
      res.status(404).send({ statusCode: 404, message: "Author not FOUND" });
    }
    res
      .status(200)
      .send({ statusCode: 200, message: "Author deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Internal server error", error });
  }
});

module.exports = authors;
