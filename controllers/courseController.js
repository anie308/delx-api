const Course = require("../models/courseModel");


const cloudinary = require("../cloud");
const createLesson = async (req, res) => {
  const {
    title,
    description,
    category,
    slug,
    isPaid,
    price,
    lessons,
    instructor,
  } = req.body;

  const isAlreadyExists = await Course.findOne({ slug });
  if (isAlreadyExists)
    return res.status(400).json({ error: "Course already exists" });

  const { file } = req;

  const newLesson = new Course({
    title,
    description,
    category,
    slug,
    isPaid,
    price,
    lessons,
    instructor,
  });

  if (file) {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    newLesson.thumbnail = { url, public_id };
    // newLesson.lessons.lesson_video = { url, public_id };
  }

  await newLesson.save();
  res.json(newLesson);
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    slug,
    isPaid,
    price,
    lessons,
    instructor,
  } = req.body;

  try{
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          description,
          category,
          slug,
          isPaid,
          price,
          lessons,
          instructor,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedCourse);
  }catch(err){
    res.status(500).json(err)
  }
};
module.exports = {
  createLesson,
  updateCourse
};
