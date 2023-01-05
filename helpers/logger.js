require("dotenv").config();
class Logger {
  isDEV;
  constructor() {
    this.isDEV = process.env.MODE == "DEV";
  }
  debug(info) {
    this.isDEV ? console.log(`[DEBUG] ${info}`) : "";
  }
  info(info) {
    console.log(`[INFO] ${info}`);
  }
  error(info) {
    console.log(`[error] ${info}`);
  }
}
module.exports = new Logger();
