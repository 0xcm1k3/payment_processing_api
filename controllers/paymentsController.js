const { excuteSQL } = require("../helpers/database");
const logger = require("../helpers/logger");
const validator = require("../helpers/validation");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const paypal = require("@paypal/checkout-server-sdk");
let environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
let client = new paypal.core.PayPalHttpClient(environment);

require("dotenv").config();

// STRIPE GATEWAY
_createStripePaymentUser = async (email) => {
  try {
    if (!validator.isEmail(email)) {
      return undefined;
    }
    const customer = await stripe.customers.create({
      email: email,
    });
    const { id } = customer;
    return id;
  } catch (e) {
    logger.debug(e.message ?? error);
    return undefined;
  }
};
createStripeNewPayment = async (req, res) => {
  if (
    !req.body.amount ||
    req.body.amount <= 0 ||
    typeof req.body.amount != "number"
  )
    return res.status(400).send({
      error: "invalid order amount",
      code: "invalid_order_amount",
    });
  _createSession = async (customerID) => {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      expires_at: Math.floor(new Date().getTime() / 1000 + 3600),
      customer: customerID ?? "",
      line_items: [
        {
          price_data: {
            currency: "EUR",
            unit_amount: Math.ceil(req.body.amount * 100),
            product_data: {
              name: `CUSTOM API (${req.body.amount})`,
            },
          },
          quantity: 1,
        },
      ],
      discounts: [],
      success_url: `${process.env.SERVER_ADDR ?? ""}/payments/success-payment`,
      cancel_url: `${process.env.SERVER_ADDR ?? ""}/payments/canceled-payment`,
    });
    const { url } = session;
    return url;
  };
  try {
    const userQuery = `SELECT email_address,stripe_id from USERS WHERE email_address=\"${req.user.email}\" LIMIT 1`;
    excuteSQL(userQuery, async (err, results) => {
      if (err) {
        logger.error(err);
        return res.status(400).send({
          error: "unhandled error, please contact the admin",
          code: "unexpected_error",
        });
      }
      if (results[0].stripe_id == null || !results[0].stripe_id) {
        logger.debug(
          `creating STRIPE customer ID for user => ${req.user.email}`
        );
        _createStripePaymentUser(req.user.email).then(async (customerID) => {
          if (!customerID)
            return res.status(400).send({
              error:
                "Could not initiate a new payment , try again later or contact the admin!",
            });
          const _setUserStripeIDQuery = `UPDATE USERS SET stripe_id=\"${customerID}\" WHERE email_address=\"${req.user.email}\"`;
          excuteSQL(_setUserStripeIDQuery, async (err, results) => {
            if (err) {
              logger.error(err);
              return res.status(400).send({
                error: "unhandled error, please contact the admin",
                code: "unexpected_error",
              });
            }
            let url = await _createSession(customerID);
            return res.send({
              checkout_url: url,
            });
          });
        });
        return;
      }
      logger.debug(`user already has STRIPE customer ID => ${req.user.email}`);
      let url = await _createSession(results[0].stripe_id);
      return res.send({
        checkout_url: url,
      });
    });
  } catch (e) {
    return res.status(400).send({ error: e.message });
  }
};
handleStripePayment = async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNATURE;
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      logger.debug(err);
      logger.error("Webhook signature verification failed.");
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    data = req.body.data;
    eventType = req.body.type;
  }

  const userQuery = `SELECT email_address,stripe_id FROM USERS WHERE stripe_id=\"${data.object.customer}\" LIMIT 1`;
  switch (eventType) {
    case "checkout.session.completed":
      excuteSQL(userQuery, (err, results) => {
        if (err) return logger.error(err.error);
        if (results.length == 0)
          return logger.error(
            `no user found with this stripe ID ${data.object.customer}`
          );
        const newOrderQuery = `INSERT INTO ORDERS (owner, total,status,payment_method) VALUES (\"${
          results[0].email_address
        }\", \"${data.object.amount_total / 100}\", \"COMPLETED\", \"STRIPE\")`;
        excuteSQL(newOrderQuery, (err, results) => {
          if (err) return logger.error(err.error);
          // DO SMTH WHEN ORDER IS SUCCEED
          logger.info(`YAAAAY! new order from => ${results[0].email_address}`);
        });
      });
      break;
    case "checkout.session.expired":
      // incase order failed/expired
      excuteSQL(userQuery, (err, results) => {
        if (err) return logger.error(err.error);
        if (results.length == 0)
          return logger.error(
            `no user found with this stripe ID ${data.object.customer}`
          );
        const newOrderQuery = `INSERT INTO ORDERS (owner, total,status,payment_method) VALUES (\"${
          results[0].email_address
        }\", \"${data.object.amount_total / 100}\", \"CANCELED\", \"STRIPE\")`;
        excuteSQL(newOrderQuery, (err, results) => {
          if (err) return logger.error(err.error);
          logger.info(
            `Opps! ${results[0].email_address} failed to complete order!`
          );
        });
      });
      break;
    default:
  }
  res.sendStatus(200);
};
// PAYPAL GATEWAY
createPayPalNewPayment = async (req, res) => {
  if (!req.body.amount || typeof req.body.amount != "number")
    return res
      .status(400)
      .send({ error: "invalid order amount", code: "invalid_order_amount" });
  let request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    application_context: {
      return_url: process.env.SERVER_ADDR + "/payments/paypal/return",
      cancel_url:
        process.env.SERVER_ADDR + "/payments/paypal/return?cancel=true",
      user_action: "CONTINUE",
    },
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: req.body.amount,
        },
      },
    ],
  });
  let response = await client.execute(request);
  const newOrderQuery = `INSERT INTO ORDERS (owner,total,status,payment_method,transction_id) VALUES ('${req.user.email}','${req.body.amount}','PENDING','PAYPAL','${response.result.id}')`;
  excuteSQL(newOrderQuery, (err, results) => {
    if (err) {
      logger.error(err);
      return res.status(400).send({
        error: "unhandled error, please contact the admin",
        code: "unexpected_error",
      });
    }
    return res.send({
      checkout_url: response.result.links.find((link) => link.rel === "approve")
        .href,
    });
  });
};

const handlePayPalPayment = async (req, res) => {
  const orderQuery = `SELECT status,transction_id FROM ORDERS WHERE transction_id='${req.query.token}' LIMIT 1`;
  if (req.query.cancel && req.query.cancel?.toLowerCase() == "true") {
    excuteSQL(orderQuery, (err, results) => {
      if (err) {
        logger.error(err);
        return res.status(400).send({
          error: "unhandled error, please contact the admin",
          code: "unexpected_error",
        });
      }
      if (results.length != 0 && results[0].status == "PENDING") {
        excuteSQL(
          `UPDATE ORDERS SET status='CANCELED' WHERE transction_id='${req.query.token}'`,
          (err, order) => {
            if (err) {
              logger.error(err);
              return res.status(400).send({
                error: "unhandled error, please contact the admin",
                code: "unexpected_error",
              });
            }
          }
        );
      }
    });
    logger.info(`${req.query.token} was cancled successfully!`);
    return res.send({ message: "success" });
  }
  if (!req.query.token || !req.query.PayerID) return res.sendStatus(400);
  request = new paypal.orders.OrdersCaptureRequest(`${req.query.token}`);
  request.requestBody({});
  try {
    let response = await client.execute(request);
    excuteSQL(orderQuery, (err, results) => {
      if (err) {
        logger.error(err);
        return res.status(400).send({
          error: "unhandled error, please contact the admin",
          code: "unexpected_error",
        });
      }
      if (results.length != 0) {
        excuteSQL(
          `UPDATE ORDERS SET status='COMPLETED' WHERE transction_id='${req.query.token}'`,
          (err, order) => {
            if (err) {
              logger.error(err);
              return res.status(400).send({
                error: "unhandled error, please contact the admin",
                code: "unexpected_error",
              });
            }
            return res.status({ message: "success" });
          }
        );
      }
    });
    logger.info(`${req.query.token} was completed successfully!`);
    return res.send({ message: "success" });
  } catch (e) {
    logger.error(e?.message ?? e);
    return res.status(400).send({ error: e.message ?? e });
  }
};
module.exports = {
  createStripeNewPayment,
  handleStripePayment,
  createPayPalNewPayment,
  handlePayPalPayment,
};
