const mongoose = require("mongoose");

const PostsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: false,
      default: "General",
    },
    cover: {
      type: String,
      required: false,
      default: "#",
    },
    readTime: {
      value: {
        type: String,
        required: false,
      },
    },
    // author: {
    //   name: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "authorModel",
    //   },
    //   avatar: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "authorModel",
    //   },
    // },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "authorModel",
    },
  },
  { timestamps: true, strict: true }
);

// Esportiamo il modello
module.exports = mongoose.model("postModel", PostsSchema, "striveposts");
