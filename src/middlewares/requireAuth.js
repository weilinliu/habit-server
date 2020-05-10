const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const { JWT_SECRET_KEY } = require("../credentials");

/*
  This function will verify whether the user is logged in or not
  It expects a authorization key with a jwt as value in the request header
  If the jwt is valid, it will add the current user to the request and call next
  If the jwt is invalid, it will return with a status code 401
*/
module.exports = (req, res, next) => {
  // get the token out of the request header
  const { authorization } = req.headers; // express auto down cases all header names
  // authorization === 'Bearer fakjsdflkasjhdfkashdflkajshdfl'

  if (!authorization) {
    return res.status(401).send({ error: "You must be logged in" });
  }

  const token = authorization.replace("Bearer ", "");

  // verify the token
  jwt.verify(token, JWT_SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "You must be logged in" });
    }
    const { userId } = payload;
    const user = await User.findById(userId);
    req.user = user;
    next();
  });
};
