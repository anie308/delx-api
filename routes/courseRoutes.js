const {
  createCourse,
  updateCourse,
  getDraftCourses,
  getPublishedCourses,
  getAllCourses,
  deleteCourse,
  deleteLesson,
  addLesson,
  updateLesson,
  getLessons,
  enrollCourse,
  getSingleCourse,
} = require("../controllers/courseController");
const multer = require("../middlewares/multer");
const {
  verifyTokenAndAuthorization,
  verifyToken,
} = require("../middlewares/verifyUser");

const router = require("express").Router();

router.post(
  "/create",
  multer.single("thumbnail"),
  verifyTokenAndAuthorization,
  // multer.single("lesson_video"),
  createCourse
);
router.get("/all", verifyTokenAndAuthorization, getAllCourses);
router.get("/drafts", verifyTokenAndAuthorization, getDraftCourses);
router.get("/:courseId", getSingleCourse);
router.get("/published", getPublishedCourses);
router.post(
  "/update",
  multer.single("thumbnail"),
  verifyTokenAndAuthorization,
  updateCourse
);
router.post("/enroll/:userId/:courseId", verifyToken, enrollCourse);
router.delete("/:courseId", verifyTokenAndAuthorization, deleteCourse);

//lessons area

router.delete(
  "/:courseId/lessons/:lessonId",
  verifyTokenAndAuthorization,
  deleteLesson
);
router.patch(
  "/:courseId/lessons/:lessonId",
  verifyTokenAndAuthorization,
  updateLesson
);
router.post("/:courseId/lessons/", verifyTokenAndAuthorization, addLesson);
router.get("/:courseId/lessons", verifyToken, getLessons);

module.exports = router;
