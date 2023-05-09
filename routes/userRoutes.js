const {
  createUser,
  loginUser,
  deleteUser,
  updateUser,
  getUsers,
  getSingleUser,
  searchUser,
  getUserEnrolledCourses
} = require("../controllers/userController");
const { authValidator, loginValidator } = require("../middlewares/validtors");
const {
  verifyTokenAndAuthorization,
  verifyToken,
} = require("../middlewares/verifyUser");

const router = require("express").Router();

router.post("/signup", authValidator, createUser);
router.post("/signin", loginValidator, loginUser);
router.delete("/:userId", verifyTokenAndAuthorization, deleteUser);
router.patch("/:userId", verifyToken, updateUser);
router.get("/all", verifyTokenAndAuthorization, getUsers);
router.get('/search', verifyTokenAndAuthorization, searchUser);
router.get("/userId", verifyTokenAndAuthorization, getSingleUser);
router.get("/my-courses/:studentId", verifyToken, getUserEnrolledCourses)


module.exports = router;
