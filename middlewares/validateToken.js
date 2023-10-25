const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).send({
      statusCode: 401,
      errorType: "Token non presente",
      message:
        "Per poter utilizzare questo endpoint è necessario fornire un token di accesso",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.author = verified;

    next();
  } catch (error) {
    res.status(403).send({
      statusCode: 403,
      message: "Il Token è scaduto o non valido",
      errorType: "Token error",
    });
  }
};
