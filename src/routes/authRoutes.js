const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../credentials");

const router = express.Router();
const User = mongoose.model("User");

router.post("/signup", async (req, res) => {
  // destructure out user info from request body
  const { email, username, password } = req.body;

  // try create a new user with user info
  try {
    const user = new User({ email, username, password });
    await user.save();

    // create a jsonwebtoken and send back to the client
    const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY);
    res.send({ token });
  } catch (err) {
    console.log("Error creating the user " + err.message);
    return res.status(422).send(err.message);
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  //console.log(password);
  if (!email || !password) {
    return res.status(422).send({ error: "Must provide email and password" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: "No such user" });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY);
    res.send({ token });
  } catch (err) {
    return res.status(422).send({ error: "Invalid password or email" });
  }
});

module.exports = router;
