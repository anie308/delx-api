const Course = require("../models/courseModel");
const { isValidObjectId } = require("mongoose");

const cloudinary = require("../cloud");
const createCourse = async (req, res) => {
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
  res.status(201).json(newLesson);
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

  try {
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
    res.status(201).json(updatedCourse);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: { $eq: "published" } }).sort({
      createdAt: -1,
    });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json(err);
  }
};
const getDraftCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: { $eq: "draft" } }).sort({
      createdAt: -1,
    });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json(err);
  }
};
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId))
    return res.status(401).json({ error: "Invalid request" });

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found!" });

  await Course.findByIdAndDelete(courseId);
  res.status(200).json({ message: "Course removed successfully !" });
};

const deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    if (!isValidObjectId(courseId))
      return res.status(401).json({ error: "Invalid request" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found!" });

    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found!" });

    const selectedCourse = course.lessons;

    selectedCourse.splice(lessonId, 1);

    res.status(200).json({ course, message: "Lesson removed successfully !" });
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

const addLesson = async (req, res) => {
  const { courseId } = req.params;
  const { lesson_number, lesson_title, lesson_body } = req.body;

  if (!isValidObjectId(courseId))
    return res.status(401).json({ error: "Invalid request" });

  const newLesson = {
    lesson_number,
    lesson_title,
    lesson_body,
  };

  await Course.findOneAndUpdate(
    { _id: courseId },
    { $push: { lessons: newLesson } },
    { new: true }
  );
  res.status(201).json({ message: "Lesson added successfully !" });
};

const updateLesson = async (req, res) => {
  try {
    const { lesson_number, lesson_title, lesson_body } = req.body;
    const { courseId, lessonId } = req.params;
    if (!isValidObjectId(courseId))
      return res.status(401).json({ error: "Invalid request" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found!" });

    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found!" });

    const updatedLesson = {
      lesson_number,
      lesson_title,
      lesson_body,
    };

    await Course.findOneAndUpdate(
      { _id: courseId, "lessons._id": lessonId },
      { $set: { "lessons.$": updatedLesson } },
      { new: true }
    );
    res.status(201).json({ message: "Lesson updated successfully !" });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getLessons = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found!" });

    res.status(200).json(course.lessons);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  getPublishedCourses,
  getDraftCourses,
  getAllCourses,
  deleteLesson,
  addLesson,
  updateLesson,
  getLessons,
};
