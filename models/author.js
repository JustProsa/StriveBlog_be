const mongoose = require("mongoose");

// Schema è il metodo di mongoose che definisce la struttura di un oggetto da inserire nel db
const AuthorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    birthDay: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
      default: "#",
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
  },
  { timestamps: true, strict: true }
);

// Esportiamo il modello
module.exports = mongoose.model("authorModel", AuthorSchema, "striveauthors");
