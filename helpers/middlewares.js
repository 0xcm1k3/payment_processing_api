require("dotenv").config();
const setUser = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    jsonwebtoken.verify(
      req.headers.authorization,
      process.env.AUTH_KEY || "password",
      function (err, decode) {
        if (err) {
          req.user = undefined;
          if (err.message == "jwt expired") {
            req.sessionExpired = true;
          }
        }
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
};

module.exports = {
  setUser,
};
