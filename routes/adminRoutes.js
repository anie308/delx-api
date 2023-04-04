const { createAdmin, loginAdmin, updateAdmin } = require("../controllers/adminController");

  const { authValidator, loginValidator } = require("../middlewares/validtors");
  const {
    verifyTokenAndAuthorization,
  } = require("../middlewares/verifyUser");
  
  const router = require("express").Router();
  
  router.post("/signup", authValidator, createAdmin);
  router.post("/signin", loginValidator, loginAdmin);
  router.patch("/:adminId", verifyTokenAndAuthorization, updateAdmin);

  
  
  module.exports = router;
  