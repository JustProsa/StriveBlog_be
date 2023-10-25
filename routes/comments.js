const express = require("express");
const mongoose = require("mongoose");

const CommentModel = require("../models/comment");
const comments = express.Router();

comments.get("/posts/:idPost/comments", async (req, res) => {
  const { idPost } = req.params;

  try {
    const comments = await CommentModel.find({ post: idPost })
      .populate("post") // Popola il campo di riferimento "post"
      .populate("author"); // Popola il campo di riferimento "author"

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

comments.post("/posts/:idPost/comments/create", async (req, res) => {
  const { idPost } = req.params;
  const { author, text } = req.body;

  try {
    const newComment = new CommentModel({
      post: idPost,
      author: author,
      text: text,
    });

    const savedComment = await newComment.save();

    res.status(201).send({ statusCode: 201, savedComment });

    // Termina l'esecuzione della funzione dopo l'invio della risposta
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    // Termina l'esecuzione della funzione dopo l'invio della risposta
    return;
  }
});

// Endpoint per eliminare un commento specifico
comments.delete("/posts/:idPost/comments/:commentId", async (req, res) => {
  const { idPost, commentId } = req.params;

  try {
    // Controlla se il commento esiste
    const existingComment = await CommentModel.findOne({
      _id: commentId,
      post: idPost,
    });

    if (!existingComment) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Comment not found!" });
    }

    // Elimina il commento
    await CommentModel.findByIdAndDelete(commentId);

    res
      .status(200)
      .json({ statusCode: 200, message: "Comment deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = comments;
