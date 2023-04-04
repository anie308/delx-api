const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      unique: true,
    },
    lastname: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    address:[{
      streetaddress:{ type: String },
      city:{ type: String },
      state:{ type: String },
      zip:{ type: String },
  }],
  username: {
    type: String,
    unique: true,
  },
    lessons: [{
      courseId: { type: String },
      title: { type: String },
  }],
    role: { type: String,  default: "user" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
