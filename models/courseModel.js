const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
    },
    instructor: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
    price: {
      type: Number,
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
        // lesson_video: {
        //   type: Object,
        //   url: {
        //     type: URL,
        //   },
        //   public_id: {
        //     type: String,
        //   },
        // },
      },
    ],
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
