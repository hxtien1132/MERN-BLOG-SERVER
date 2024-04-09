const jwt = require("jsonwebtoken");
require("dotenv").config();

//create token
const generateToken = (id, name) => {
  return jwt.sign({ id, name }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const verifyToken = (id, name) => {
  return jwt.verify({ id, name }, process.env.JWT_SECRET);
};
module.exports = { generateToken };
