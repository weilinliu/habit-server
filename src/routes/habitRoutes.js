const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const Habit = mongoose.model("Habit");
const UserHabit = mongoose.model("UserHabit");
const User = mongoose.model("User");

const router = express.Router();

router.use(requireAuth);

/*
  This route list all habits of a user
*/
router.get("/habits", async (req, res) => {
  const habits = await UserHabit.find({
    userId: req.user._id,
    status: 1
  }).populate("habitId");
  const pending = await UserHabit.find({
    userId: req.user._id,
    status: 0
  })
    .populate("habitId")
    .populate("actionUserId", "-password -__v");
  res.send({ habits, pending });
});

/*
  This route create a new habit for a user
*/
router.post("/habits", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res
      .status(422)
      .send({ error: "You must provide title and description" });
  }
  try {
    // create Habit
    const habit = new Habit({ title, description });
    await habit.save();

    // create UserHabit
    const userHabit = new UserHabit({
      userId: req.user._id,
      habitId: habit._id,
      status: 1,
      progress: 0,
      actionUserId: req.user._id,
      lastUpdate: null
    });
    await userHabit.save();

    res.send({ habit, userHabit });
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

/*
  This route shows information about one habit
*/
router.get("/habits/:habitId", async (req, res) => {
  // const habit = await Habit.findById(req.params.habitId);
  // res.send(habit);
  UserHabit.find({ habitId: req.params.habitId, status: 1 })
    .populate("userId", "-password -__v")
    .then(result => {
      res.send(result);
    })
    .catch(err => res.send(err));
});

/*
  This route adds one user to an existing habit
*/
router.post("/habits/:habitId", async (req, res) => {
  const userHabit = UserHabit.findOne({
    userId: req.body.friendId,
    habitId: req.params.habitId
  });
  if (userHabit != null) {
    return;
  }
  const newUserHabit = new UserHabit({
    userId: req.body.friendId,
    habitId: req.params.habitId,
    actionUserId: req.user._id,
    status: 0
  });
  await newUserHabit.save();
  res.send(newUserHabit);
});

/*
This route updates a userHabit (accept a habit or update progress)
update: { $set: { status: 1 } } || { $inc: { progress: 1}, $set: {lastUpdate: date} }
*/
router.patch("/habits/:habitId", async (req, res) => {
  const update = req.body.update;
  const userHabit = await UserHabit.findOne({
    habitId: req.params.habitId,
    userId: req.user._id
  });
  if (!userHabit) {
    return;
  }
  if (userHabit.status === 0) {
    await Habit.findByIdAndUpdate(userHabit.habitId, {
      $inc: { numParticipants: 1 }
    });
  }
  const newUserHabit = await UserHabit.findOneAndUpdate(
    { habitId: req.params.habitId, userId: req.user._id },
    update,
    { new: true, useFindAndModify: false }
  );
  res.send(newUserHabit);
});

/*
This route deletes a userHabit (decline a habit)
*/
router.delete("/habits/:habitId", async (req, res) => {
  const userHabit = await UserHabit.findOne({
    habitId: req.params.habitId,
    userId: req.user._id
  });
  if (!userHabit) {
    return;
  }
  if (userHabit.status === 1) {
    const habit = await Habit.findById(userHabit.habitId);
    if (habit.numParticipants === 1) {
      await Habit.findByIdAndDelete(userHabit.habitId);
    } else {
      await Habit.findByIdAndUpdate(
        userHabit.habitId,
        {
          $inc: { numParticipants: -1 }
        },
        { useFindAndModify: false }
      );
    }
  }
  const deteledHabit = await UserHabit.findOneAndDelete({
    habitId: req.params.habitId,
    userId: req.user._id
  });
  res.send(deteledHabit);
});

module.exports = router;
