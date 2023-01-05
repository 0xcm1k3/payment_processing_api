const express = require("express");
const {
  createStripeNewPayment,
  handlePayPalPayment,
} = require("../controllers/paymentsController");
const { loginRequired } = require("../helpers/middlewares");

const router = express.Router();

router
  .route("/:gateway/webhook")
  .post(express.raw({ type: "application/json" }), (req, res) => {
    switch (req.params.gateway.toLowerCase()) {
      case "stripe":
        handleStripePayment(req, res);
        break;
      case "paypal":
        return res.send({ ok: "comming soon" });
        // handlePayPalPayment(req, res);
        break;
      case "crypto":
        return res.send({ ok: "comming soon" });

        // handleCryptoPayment(req, res);
        break;
      default:
        return res.status(400).send({
          error: "invalid_payment_gateway",
        });
    }
  })
  .all((req, res) => res.sendStatus(405));

router
  .route("/:gateway/new")
  .post(loginRequired, (req, res) => {
    switch (req.params.gateway.toLowerCase()) {
      case "stripe":
        createStripeNewPayment(req, res);
        break;
      case "paypal":
        createPayPalNewPayment(req, res);

        break;
      case "crypto":
        return res.send({ ok: "comming soon" });

        break;
      default:
        return res.status(400).send({
          error: "invalid_payment_gateway",
        });
    }
  })
  .all((req, res) => res.sendStatus(405));

router
  .route("/paypal/return")
  .get(handlePayPalPayment)
  .all((req, res) => res.sendStatus(405));
router.route("/:gateway/").all((req, res) => res.sendStatus(405));

module.exports = router;
