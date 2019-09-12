const jwt = require("jsonwebtoken");
const secret = require("../misc/secret");

module.exports = (req, res, next) => {
  console.log(req.get("Authorization"));
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secret);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  console.log("Authenticated");
  req.userId = decodedToken.userId;
  req.role = decodedToken.role;
  next();
};
