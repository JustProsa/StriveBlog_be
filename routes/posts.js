const express = require("express");
const posts = express.Router();
const logger = require("../middlewares/logger");
const multer = require("multer");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2; //importiamo cloudinary per poter postare files sul cloud
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();
// importiamo il modello dei posts
const PostModel = require("../models/post");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); // diamo a cloudinary le sue chiavi salvate in .env

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "happyfolder", //nome della cartella su cloudinary
    format: async (req, file) => "png", //formato del file
    public_id: (req, file) => file.name,
  },
});

const internalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    //posizione in cui salvare i file
    cb(null, "uploads");
  },
  // nome del file che verrà salvato, molto importante per evitare conflitto dei nomi. deve essere univoco a prescindere dal nome di partenza
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`; //crypto è una libreria di node che genera un id univoco automaticamente
    //Rcuperiamo da tutto solo l'estensione dello stesso file
    const fileExtension = file.originalname.split(".").pop();
    // eseguiamo la callback con il titolo completo
    cb(null, `${uniqueSuffix}.${fileExtension}`);
  },
});

const upload = multer({ storage: internalStorage });
const cloudUpload = multer({ storage: cloudStorage });

posts.post(
  "/posts/cloudUpload",
  cloudUpload.single("cover"),
  async (req, res) => {
    try {
      res.status(200).json({ cover: req.file.path });
    } catch (error) {
      res
        .status(500)
        .send({ statusCode: 500, message: "Errore interno del server" });
    }
  }
);

posts.post("/posts/upload", upload.single("cover"), async (req, res) => {
  // ci serve l'indirizzo del nostro server
  const url = `${req.protocol}://${req.get("host")}`; //genera solo l'url del nostro server in modo automatico nel caso in cui cambiasse col tempo

  try {
    const imgUrl = req.file.filename; //il nostro file sarà in req.file perché arriva dal frontend
    res.status(200).json({ img: `${url}/uploads/${imgUrl}` });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Errore interno del server" });
  }
});

posts.get("/posts", logger, async (req, res) => {
  // logica del get

  const { page = 1, pageSize = 3 } = req.query;

  try {
    const posts = await PostModel.find()
      .populate("author")
      .limit(pageSize)
      .skip((page - 1) * pageSize);

    const totalPosts = await PostModel.count();

    res.status(200).send({
      statusCode: 200,
      currentPage: Number(page),
      totalPages: Math.ceil(totalPosts / pageSize),
      totalPosts,
      posts,
    });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Errore interno del server" });
  }
});

posts.get("/posts/byId/:id", logger, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await PostModel.findById(id);
    if (!post) {
      return res
        .status(404)
        .send({ statusCode: 404, message: "Post not found!" });
    }

    res
      .status(200)
      .send({ statusCode: 200, message: "That's your post!", post });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: `Internal server error`, error });
  }
});

posts.post("/posts", async (req, res) => {
  // logica del post

  console.log(req.body);

  const newPost = new PostModel({
    // si crea una nuova classe dal modello PostModel
    title: req.body.title,
    category: req.body.category,
    cover: req.body.cover,
    readTime: {
      value: req.body.readTime.value,
      timeUnit: req.body.readTime.timeUnit,
    },
    // author: { name: req.body.author.firstName, avatar: req.body.author.avatar },
    author: req.body.author,
    // avatar: req.body.author.avatar,
  });

  try {
    const post = await newPost.save(); // Il metodo .save() va a scrivere direttamente nel database

    res.status(201).send({
      statusCode: 201,
      message: "Post saved successfully",
      payload: post,
    });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Errore interno del server", error });
  }
});

posts.delete("/posts/delete/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await PostModel.findByIdAndDelete(postId);

    if (!post) {
      res.status(404).send({ statusCode: 404, message: "Post not FOUND" });
    }

    res
      .status(200)
      .send({ statusCode: 200, message: "Post deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Errore interno del server" });
  }
});

posts.patch("/posts/update/:postId", async (req, res) => {
  const { postId } = req.params;

  const postExist = await PostModel.findById(postId);

  if (!postExist) {
    return res.status(404).send({ statusCode: 404, message: "NOT FOUND!" });
  }

  try {
    const dataToUpdate = req.body;
    const options = { new: true };
    const result = await PostModel.findByIdAndUpdate(
      postId,
      dataToUpdate,
      options
    );

    res
      .status(200)
      .send({ statusCode: 200, message: "Post edited succesfully", result });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Errore interno del server" });
  }
});

//esportiamo il modulo
module.exports = posts;
