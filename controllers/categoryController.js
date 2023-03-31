const Category = require("../models/categoryModel");

const createCategory = async (req, res) => {
  const { name, slug } = req.body;

  const isAlreadyExists = await Category.findOne({ name });

  if (isAlreadyExists)
    return res.status(400).json({ error: "Category already Exists" });

  const newCategory = new Category({
    name,
    slug,
  });

  newCategory.save();
  res.status(201).json(newCategory);
};

const getCategories = async (req, res) => {
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createCategory, getCategories };
