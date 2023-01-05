const mysql = require("mysql");
const logger = require("./logger");
const Logger = require("./logger");

require("dotenv").config();

const db_config = {
  multipleStatements: true,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USERNAME || "db_user",
  password: process.env.DB_PASSWORD || "db_pwd",
  database: process.env.DB_NAME || "db_name",
};

const initDB = async (callback) => {
  try {
    var error;
    var connection = mysql.createConnection(db_config);
    const init_query = `CREATE TABLE IF NOT EXISTS USERS (
        ID int NOT NULL AUTO_INCREMENT,
        full_name varchar(255) NOT NULL,
        email_address varchar(255) UNIQUE,
        password varchar(255),
        stripe_id varchar(255),
        registeredAt TIMESTAMP  DEFAULT CURRENT_TIMESTAMP NOT NULL,
        lastSeenAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (ID),
        UNIQUE (ID)
    );
    CREATE TABLE IF NOT EXISTS ORDERS (
        ID int NOT NULL AUTO_INCREMENT,
        owner varchar(255) NOT NULL,
        total varchar(255),
        status ENUM("COMPLETED","CANCELED","PENDING"),
        transction_id varchar(255),
        payment_method ENUM("STRIPE","PAYPAL"),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (ID),
        UNIQUE (ID)
    );
    `;
    connection.connect();
    connection.query(init_query, (error, results, fields) => {
      if (error) error = error?.sqlMessage ?? error;
      callback(error);
    });
    connection.end();
  } catch (e) {
    error = e;
    logger.error(e);
  }
};
const excuteSQL = (query, callback) => {
  var connection = mysql.createConnection(db_config);
  connection.connect();
  connection.query(query, function (error, results, fields) {
    if (error) error = { error: error?.sqlMessage, code: error?.code };
    callback(error, results);
  });
  connection.end();
};

module.exports = {
  excuteSQL,
  initDB,
};
