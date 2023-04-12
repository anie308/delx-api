const Course = require("../models/courseModel");
const User = require("../models/userModel");
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
  console.log(newLesson);
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

// courses: courses.map((course) => ({
//
// })

const getSingleCourse = async (req,res)=> {
  const {slug} = req.params
  try{
    const singleCourse = await Course.findOne({ slug });
    console.log(singleCourse)
    // res.status(200).json({
    //   singleCourse: singleCourse.map((course) => ({
    //     id: course._id,
    //     title: course.title,
    //     description: course.description,
    //     slug: course.slug,
    //     thumbnail: course.thumbnail?.url,
    //     category: course.category,
    //     status: course.status,
    //     lessons: course.lessons,
    //     isPaid: course.isPaid,
    //     instructor: course.instructor,
    //   }))
    // })
  }catch(err){

  }
}

const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: { $eq: "published" } }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      courses: courses.map((course) => ({
        id: course._id,
        title: course.title,
        description: course.description,
        slug: course.slug,
        thumbnail: course.thumbnail?.url,
        category: course.category,
        status: course.status,
        // lessons: course.lessons,
        isPaid: course.isPaid,
        instructor: course.instructor,
      })),
    });
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
    const courseCount = await Course.countDocuments();
    res.status(200).json({
      courses: courses.map((course) => ({
        id: course._id,
        title: course.title,
        description: course.description,
        slug: course.slug,
        thumbnail: course.thumbnail?.url,
        category: course.category,
        status: course.status,
      })),
      courseCount,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// const enrollCourse = async (req, res) => {
//   const { id: courseId } = req.params;
//   const { id: userId } = req.params;
//   const course = await Course.findOne({ courseId });
//   const student = await User.findOne({ userId });

//   if (!course || !student) {
//     return res.status(404).json({ message: "Course or user not found." });
//   }

//   if (student.lessons?.includes(courseId)) {
//     return res
//       .status(400)
//       .json({ message: "User already enrolled in course." });
//   }
//    const {title} = course
//   const courseEnrolled = { title, courseId};

//    await User.findOneAndUpdate(
//     { _id: courseId },
//     { $push: { lessons: courseEnrolled } },
//     { new: true }
//   );

//   res.status(201).json(student);
//   //

// if (course.isPaid) {
//   const { price, title } = course;
//   const { email, username } = student;
//   try {
//     const response = await axios.post("http://localhost:5000/api/payment", {
//       headers: {
//         Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
//       },
//       json: {
//         tx_ref: "hooli-tx-1920bbtytty",
//         amount: price,
//         currency: "NGN",
//         redirect_url:
//           "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
//         meta: {
//           consumer_id: 23,
//           consumer_mac: "92a3-912ba-1192a",
//         },
//         customer: {
//           email: email,
//           phonenumber: "080****4528",
//           name: username,
//         },
//         customizations: {
//           title: `Payment for ${title} course`,
//           logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png",
//         },
//       },
//     });

//     res.status(200).json(response.data);
//     // student.lessons.push({ courseId, course_name: course.title });
//   } catch (err) {
//     console.log(err);
//   }
// } else {
//   const enrollCourse = await User.findByIdAndUpdate(
//     { _id: id },
//   { $push: { lessons: {id, course_name: course.title} } },
//   { new: true }
//   );
//   res.status(201).json(enrollCourse);
// }
//};

const enrollCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const course = await Course.findOne({ _id: courseId });
    const student = await User.findOne({ _id: userId });

    if (!course || !student) {
      return res.status(404).json({ message: "Course or user not found." });
    }

    const courseIsEnrolled = student.lessons.some(
      (item) => item.courseId === courseId
    );
    if (courseIsEnrolled) {
      return res
        .status(400)
        .json({ message: "User already enrolled in course." });
    }

    const courseEnrolled = { title: course.title, courseId };

    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { lessons: courseEnrolled } },
      { new: true }
    );
    await Course.findOneAndUpdate(
      { _id: courseId },
      { $inc: { enrollment: 1 } },
      { new: true }
    );

    res.status(201).json(student);
  } catch (err) {
    console.log(err);
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
  enrollCourse,
  getSingleCourse
};
