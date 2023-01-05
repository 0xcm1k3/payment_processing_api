const express = require("express");
const { sign_in, sign_up } = require("../../controllers/authController");

router = express.Router();
router.route("/").all((req, res) => res.sendStatus(405));
router
  .route("/register")
  .post(sign_up)
  .all((req, res) => res.sendStatus(405));
router
  .route("/login")
  .post(sign_in)
  .all((req, res) => res.sendStatus(405));

module.exports = router;
