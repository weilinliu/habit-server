const mongoose = require("mongoose");

const FriendshipSchema = new mongoose.Schema({
  userOneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userTwoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: { type: Number, default: 0 },
  actionUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

mongoose.model("Friendship", FriendshipSchema);
