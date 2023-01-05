const bcrypt = require("bcrypt");
const uuid = require("uuid");
const crypto = require("crypto");

exports.hashThis = (value) =>
  bcrypt.hashSync(value + process.env.AUTH_KEY || "password", 10);
exports.generateID = () => {
  let _uuid = parseInt(Math.floor(Math.random() * Date.now()) | 10);
  if (_uuid <= 0) {
    _uuid = this.generateID();
  }
  return _uuid;
};
exports.generateUUID = () => uuid.v4();
exports.encrypt = (text, encoding) => {
  try {
    var cipher = crypto.createCipheriv(
      "aes192",
      Buffer.from(process.env.DEVELOPER_PRIVATE_KEY),
      process.env.DEVELOPER_PRIVATE_KEY.substring(0, 16)
    );
    encoding = encoding || "hex";
    var result = cipher.update(text, "utf8", encoding);
    result += cipher.final(encoding);

    return result;
  } catch (e) {
    console.log(e.message);
    return undefined;
  }
};
exports.compareHash = (hash, secret) => bcrypt.compareSync(secret, hash);
