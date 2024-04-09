const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const HttpError = require("../models/errorModel");
const authMiddleware = asyncHandler(async (req, res, next) => {
  const Authorization = req.headers.Authorization || req.headers.authorization;
  // console.log(Authorization, "Author");
  if (Authorization && Authorization.startsWith("Bearer")) {
    const token = Authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
      if (err) throw new HttpError("Unauthorized .Invalid token", 404);
      req.user = info;
    });
  }
  next();
});
module.exports = authMiddleware;
