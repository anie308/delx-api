const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
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
      required: true,
      unique: true,
    },
    instructor: {
      type: String,
      required: true,
      unique: true,
    },
    lessons: [
      {
        lesson_number: {
          type: Number,
        },
        lesson_title: {
          type: String,
          required: true,
        },
        lesson_body: {
          type: String,
          required: true,
        },
        lession_video:{
          type: Object,
          url: {
            type: URL,
          },
          public_id: {
            type: String,
          },
        }
      },
    ],
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
