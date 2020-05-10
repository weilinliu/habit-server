const mongoose = require("mongoose");

const UserHabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit",
    required: true
  },
  status: { type: Number, required: true },
  actionUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  progress: { type: Number, default: 0 },
  lastUpdate: { type: String }
});

mongoose.model("UserHabit", UserHabitSchema);
