const logger = (req, res, next) => {
  const { url, ip, method } = req; //sono metodi che possono essere utilizzati

  console.log(
    `${new Date().toISOString()} Effettutata richiesta ${method} all' endpoint: ${url} all' IP: ${ip}`
  );

  next();
};

module.exports = logger;
