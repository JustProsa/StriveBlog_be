const express = require("express");
const mongoose = require("mongoose");
const logger = require("./middlewares/logger");
const authorsRoute = require("./routes/authors");
const postsRoute = require("./routes/posts");
const commentsRoute = require("./routes/comments");
const loginRoute = require("./routes/login");
const githubRoute = require("./routes/github");
const path = require("path");
const cors = require("cors");

const PORT = 54321;

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/", authorsRoute);
app.use("/", postsRoute);
app.use("/", commentsRoute);
app.use("/", loginRoute);
app.use("/", githubRoute);

mongoose.connect(
  "mongodb+srv://theroescode:6a9d0Ii16IXqNg87@happycluster.0r5fkx1.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error during db connection"));

db.once("open", () => {
  console.log("database successfully connected");
});

app.listen(PORT, () => console.log(`Server up and running on PORT: ${PORT}`));
