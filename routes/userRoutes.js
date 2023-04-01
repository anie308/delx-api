const {
  createUser,
  loginUser,
  deleteUser,
  updateUser,
  getUsers,
  getSingleUser,
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
router.put("/:userId", verifyToken, updateUser);
router.get("/all", verifyTokenAndAuthorization, getUsers);
router.get("/userId", verifyTokenAndAuthorization, getSingleUser);


module.exports = router;
