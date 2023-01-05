const express = require("express");
const mysql = require("mysql");
const { excuteSQL, initDB } = require("./helpers/database");
const logger = require("./helpers/logger");
const { setUser } = require("./helpers/middlewares");
const authRoute = require("./routes/authentication/authRoute");
require("dotenv").config();
const app = express();
app.use(express.json());

app.use(setUser);
app.use("/auth", authRoute);

initDB(async (error) => {
  if (error) {
    logger.debug(`failed to connect to db due to ${error}`);
    return logger.error("Failed to establish database connection");
  }
  app.listen(process.env.PORT || 6000, () => {
    logger.info(`server running on port ${process.env.PORT || 6000}`);
  });
});
