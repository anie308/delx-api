const Category = require("../models/categoryModel");

const createCategory = async (req, res) => {
  const { name, slug } = req.body;

  try {
    const isAlreadyExists = await Category.findOne({ name });

    if (isAlreadyExists)
      return res.status(400).json({ error: "Category already exists" });

    const newCategory = new Category({
      name,
      slug,
    });

    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: "Error saving category" });
  }
};
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        $set: {
         name,
         slug
        },
      },
      { new: true }
    );
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
};
const deleteCategory = async (req, res) => {
  const { catId } = req.params;
  if (!isValidObjectId(catId))
    return res.status(401).json({ error: "Invalid request" });

  const category = await Category.findById(catId);
  if (!category) return res.status(404).json({ error: "Category not found!" });

  await Category.findByIdAndDelete(catId);
  res.json({ message: "Category removed successfully !" });
};

const getCategories = async (req,res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    const categoryCount = await Category.countDocuments();

    res.status(200).json({
      categories: categories.map((category) => ({
        id: category._id,
        name: category.name,
        slug: category.slug,
      })),
      categoryCount: categoryCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createCategory, getCategories, deleteCategory, updateCategory };
