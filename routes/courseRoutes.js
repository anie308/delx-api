const { createLesson } = require("../controllers/courseController");
const multer = require("../middlewares/multer");

const router = require("express").Router();

router.post(
  "/create",
  multer.single("thumbnail"),
    // multer.single("lesson_video"),
  createLesson
);

module.exports = router;
