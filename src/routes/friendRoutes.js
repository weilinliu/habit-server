const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const User = mongoose.model("User");
const Friendship = mongoose.model("Friendship");

const router = express.Router();

router.use(requireAuth);

/*
This route shows a list of friendships
*/
router.get("/friends", async (req, res) => {
  const friendships = await Friendship.find({
    $and: [
      { $or: [{ userOneId: req.user._id }, { userTwoId: req.user._id }] },
      { status: 1 }
    ]
  })
    .populate({
      path: "userOneId",
      match: { _id: { $ne: req.user._id } },
      select: "-password -__v"
    })
    .populate({
      path: "userTwoId",
      match: { _id: { $ne: req.user._id } },
      select: "-password -__v"
    });
  const pending = await Friendship.find({
    $and: [
      { $or: [{ userOneId: req.user._id }, { userTwoId: req.user._id }] },
      { status: 0 },
      { actionUserId: { $ne: req.user._id } }
    ]
  }).populate("actionUserId", "-password -__v");
  res.send({ friendships, pending });
});

/*
This route creates a friendship
*/
router.post("/friends", async (req, res) => {
  const myId = req.user._id.toString();
  const friend = await User.findOne({ email: req.body.email });
  if (!friend) {
    res.send("No such user");
    return;
  }
  const friendId = friend._id.toString();
  let userOneId,
    userTwoId = null;
  if (myId.localeCompare(friendId) == -1) {
    userOneId = myId;
    userTwoId = friendId;
  } else {
    userOneId = friendId;
    userTwoId = myId;
  }

  const friendship = await Friendship.findOne({ userOneId, userTwoId });
  if (friendship != null) {
    res.send("Already exists");
    return;
  }

  try {
    const newFriendship = new Friendship({
      userOneId,
      userTwoId,
      status: 0,
      actionUserId: myId
    });
    await newFriendship.save();
    res.send(newFriendship);
  } catch (err) {
    res.send("error");
  }
});

/*
This route updates a friendship (accept a friend request)
*/
router.patch("/friends/:friendshipId", async (req, res) => {
  try {
    const friendship = await Friendship.findByIdAndUpdate(
      req.params.friendshipId,
      { $set: { status: 1, actionUserId: req.user._id } },
      { new: true, useFindAndModify: false }
    );
    res.send(friendship);
  } catch (err) {
    res.send(err);
  }
});

/*
This route deletes or decline a friendship
*/
router.delete("/friends/:friendshipId", async (req, res) => {
  await Friendship.findByIdAndDelete(req.params.friendshipId);
  res.send("deleted");
});

module.exports = router;
