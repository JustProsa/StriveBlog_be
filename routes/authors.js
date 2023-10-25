const express = require("express");
const authors = express.Router();
const logger = require("../middlewares/logger");
const bcrypt = require("bcrypt");
const multer = require("multer");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const AuthorModel = require("../models/author");

// configurazione cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatarsfolder", //nome della cartella su cloudinary
    format: async (req, file) => "png", //formato del file
    public_id: (req, file) => file.name,
  },
});

const internalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    //posizione in cui salvare i file
    cb(null, "avatars");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    // estensione dello stesso file
    const fileExtension = file.originalname.split(".").pop();
    // eseguiamo la callback con il titolo completo
    cb(null, `${uniqueSuffix}.${fileExtension}`);
  },
});

const upload = multer({ storage: internalStorage });
const cloudUpload = multer({ storage: cloudStorage });

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

authors.post(
  "/authors/cloudUpload",
  cloudUpload.single("avatar"),
  async (req, res) => {
    try {
      res.status(200).json({ avatar: req.file.path });
    } catch (error) {
      res
        .status(500)
        .send({ statusCode: 500, message: "Errore interno del server" });
    }
  }
);

authors.post("/authors/upload", upload.single("avatar"), async (req, res) => {
  // ci serve l'indirizzo del nostro server
  const url = `${req.protocol}://${req.get("host")}`;

  try {
    const imgUrl = req.file.filename; //il nostro file sarà in req.file perché arriva dal frontend
    res.status(200).json({ img: `${url}/avatars/${imgUrl}` });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Errore interno del server" });
  }
});

authors.post("/authors", async (req, res) => {
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
