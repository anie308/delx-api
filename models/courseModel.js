const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String,  },
  content: { type: String,  },
  // videoUrl: { type: String, required: true },
  duration: { type: Number,  },
  // quiz: { type: String }
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // required: true,
      trim: true,
        },
    slug: {
      type: String,
      // required: true,
      trim: true,
      unique: true,
    },
    thumbnail: {
      type: Object,
      url: {
        type: URL,
      },
      public_id: {
        type: String,
      },
    },
    description: {
      type: String,
      // required: true,
      trim: true,
    },
    instructor: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
      // required: true,
    },
    price: {
      type: Number,
    },
    status:{
      type: String,
      enum: ["draft", "published"],
      default: 'draft'
    },
    enrollment: {
      type: Number,
      default: 0,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      }
    ],
    lessons: [lessonSchema],
    category: {
      type: String,
      // required: true,
    },
    level:{
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
