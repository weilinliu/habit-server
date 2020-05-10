const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  numParticipants: { type: Number, default: 1 }
});

mongoose.model("Habit", habitSchema);
