require("./src/models/User");
require("./src/models/Habit");
require("./src/models/UserHabit");
require("./src/models/Friendship");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const requireAuth = require("./src/middlewares/requireAuth");

const authRoutes = require("./src/routes/authRoutes");
const habitRoutes = require("./src/routes/habitRoutes");
const friendRoutes = require("./src/routes/friendRoutes");

const app = express();
app.use(bodyParser.json());
app.use(authRoutes);
app.use(habitRoutes);
app.use(friendRoutes);

const mongodbUri = "DATABASE URL";

mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

mongoose.connection.on("connected", () => {
  console.log("Connected to database instance");
});

mongoose.connection.on("error", err => {
  console.log("Error connecting to database " + err);
});

app.get("/", requireAuth, (req, res) => {
  res.send({ email: req.user.email, username: req.user.username });
});

// app.listen(3000, () => {
//   console.log("Listening on port 3000");
// });

module.exports = app;
