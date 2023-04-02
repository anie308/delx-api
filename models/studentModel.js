const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
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
    lessions: [{
        class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
        class_name: { type: String },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
