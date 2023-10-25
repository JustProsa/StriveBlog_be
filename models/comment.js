const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "postModel", // Riferimento al modello dei post
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "authorModel", // Riferimento al modello degli autori
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model(
  "commentModel",
  CommentSchema,
  "strivecomments"
);
