const jsonwebtoken = require("jsonwebtoken");
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
loginRequired = function (req, res, next) {
  if (req.user) {
    next();
  } else if (req.sessionExpired) {
    return res
      .status(440)
      .json({ error: "SESSION TIMED OUT", code: "session_expired" });
  } else {
    return res
      .status(401)
      .json({ error: "unauthorized user", code: "user_not_auth" });
  }
};
module.exports = {
  setUser,
  loginRequired,
};
