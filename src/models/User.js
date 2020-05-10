const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// this function will run before saving a user to database
// it will hash user password before saving it to the database
userSchema.pre("save", function(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  // generate the salt value for hash function
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    // hash the password with salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      // save the hashed password
      user.password = hash;
      next();
    });
  });
});

// this function validates the candidate password using hashed password in the database
userSchema.methods.comparePassword = function(candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatched) => {
      if (err) {
        return reject(err);
      }
      if (!isMatched) {
        return reject(false);
      }
      resolve(true);
    });
  });
};

mongoose.model("User", userSchema);
