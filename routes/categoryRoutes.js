const { createCategory, getCategories, deleteCategory } = require("../controllers/categoryController");
const { categoryValidator, validate } = require("../middlewares/validtors");
const {
  verifyTokenAndAuthorization,
  verifyToken,
} = require("../middlewares/verifyUser");

const router = require("express").Router();

router.post(
  "/create",
  verifyTokenAndAuthorization,
  categoryValidator,
  validate,
  createCategory 
);

router.delete('/:catId', verifyTokenAndAuthorization, deleteCategory)
router.put('/:catId', verifyTokenAndAuthorization, updateCategory)

router.get('/all', getCategories)

module.exports = router;