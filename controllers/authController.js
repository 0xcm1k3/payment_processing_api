const { excuteSQL } = require("../helpers/database");
const { hashThis, compareHash } = require("../helpers/encryption");
const jwt = require("jsonwebtoken");
const validator = require("../helpers/validation");
// sign_up
const sign_up = (req, res) => {
  if (
    !req.body.full_name ||
    !req.body.password ||
    !req.body.confirm_password ||
    !req.body.email_address
  )
    return res
      .status(400)
      .send({ error: "missing params", error_code: "missing_params" });

  if (req.body.password != req.body.confirm_password)
    return res.status(400).send({
      error: "passwords doesnt match",
      error_code: "passwords_doesnt_match",
    });
  if (req.body.password.length < 6)
    return res.status(400).send({
      error: "please enter a strong password, at least 6 chars",
      error_code: "weak_password",
    });
  var validname = req.body.full_name
    .split(" ")
    .map((name) => (validator.isString(name) ? name : ""))
    .join(" ");

  if (validname == "")
    return res.status(400).send({
      error: "please enter a valid name",
      error_code: "invalid_name",
    });
  if (!validator.isEmail(req.body.email_address))
    return res.status(400).send({
      error: "please enter a valid email address",
      error_code: "invalid_email_address",
    });
  const signupQuery = `INSERT INTO USERS (full_name, email_address, password) VALUES (\"${validname}\", \"${
    req.body.email_address
  }\", \"${hashThis(req.body.password)}\");`;
  excuteSQL(signupQuery, (err, result) => {
    if (err) {
      if (err.code == "ER_DUP_ENTRY")
        return res.status(400).send({
          error: "email address is already in use",
          error_code: "invalid_email_address",
        });
      return res.status(403).send(err);
    }
    return res.send({ message: "success" });
  });
};
//sign_in
const sign_in = (req, res) => {
  if (!req.body.email_address || !req.body.password)
    return res
      .status(400)
      .send({ error: "missing params", error_code: "missing_params" });

  const checkifUserExist = `SELECT email_address,password FROM USERS WHERE email_address=\"${req.body.email_address}\" LIMIT 1`;

  excuteSQL(checkifUserExist, (err, results) => {
    if (err) return res.status(400).send(err);

    if (results.length == 0)
      return res.status(404).send({
        error: "user does not exist",
        code: "user_not_found",
      });
    const isCorrectPwd = compareHash(
      results[0].password,
      `${req.body.password}${process.env.AUTH_KEY || "password"}`
    );
    if (!isCorrectPwd) {
      return res
        .status(401)
        .send({ error: "invalid password", code: "invalid_password" });
    }
    const token = jwt.sign(
      {
        email: results[0].email_address,
        createdAT: Date.now(),
      },
      process.env.AUTH_KEY ?? "password",
      { expiresIn: "24h" }
    );
    return res.send({ message: "success", token: token });
  });
};

module.exports = {
  sign_up,
  sign_in,
};
