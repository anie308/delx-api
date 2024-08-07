const Course = require("../models/courseModel");
const Student = require("../models/userModel");
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

const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: { $eq: "published" } }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      status: "suceess",
      message: "Courses fetched successfully",
      data: courses,
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

const getCourse = async (req, res) => {
  const { slug } = req.params;
  if (!slug) return res.status(401).json({ error: "Invalid request" });

  const course = await Course.findOne({ slug });
  if (!course) return res.status(404).json({ error: "Course not found!" });
  res.json({
    status: "success",
    message: "Course fetched successfully",
    data: course,
  });
};

// const enrollCourse = async (req, res) => {
//   const { id: courseId } = req.params;
//   const { id: StudentId } = req.params;
//   const course = await Course.findOne({ courseId });
//   const student = await Student.findOne({ StudentId });

//   if (!course || !student) {
//     return res.status(404).json({ message: "Course or Student not found." });
//   }

//   if (student.lessons?.includes(courseId)) {
//     return res
//       .status(400)
//       .json({ message: "Student already enrolled in course." });
//   }
//    const {title} = course
//   const courseEnrolled = { title, courseId};

//    await Student.findOneAndUpdate(
//     { _id: courseId },
//     { $push: { lessons: courseEnrolled } },
//     { new: true }
//   );

//   res.status(201).json(student);
//   //

// if (course.isPaid) {
//   const { price, title } = course;
//   const { email, Studentname } = student;
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
//           name: Studentname,
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
//   const enrollCourse = await Student.findByIdAndUpdate(
//     { _id: id },
//   { $push: { lessons: {id, course_name: course.title} } },
//   { new: true }
//   );
//   res.status(201).json(enrollCourse);
// }
//};

const enrollCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    // Find the course and student by their IDs
    const course = await Course.findById(courseId);
    const student = await Student.findById(userId);

    // If either the course or the student cannot be found, return a 404 error
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Check if the student is already enrolled in the course

    const isEnrolled = await Course.findOne({
      _id: courseId,
      enrolledStudents: student,
    });
    if (isEnrolled) {
      return res.status(404).json("Student is  Enrolled in this course");
    }

    // Create an object to represent the enrolled course

    // Add the enrolled student to the course array
    course.enrolledStudents.push(student);
    // await student.updateOne({ $push: { lessons: enrolledCourse } });

    // Increment the enrollment count for the course
    course.updateOne({ $inc: { enrollment: 1 } });
    await course.save();

    // Return the updated student object
    return res.status(201).json({
      message: "Course Enrolled Successfully",
      status: "success",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
  // try {
  //   const { courseId, userId } = req.body;
  //   const course = await Course.findById(courseId);
  //   const student = await User.findById(userId);

  //   if (!course || !student) {
  //     return res.status(404).json({ message: "Course or user not found." });
  //   }

  //   const courseIsEnrolled = student.lessons.some(
  //     (lesson) => lesson.courseId.toString() === courseId
  //   );
  //   if (courseIsEnrolled) {
  //     return res.status(400).json({ message: "User already enrolled in course." });
  //   }

  //   const courseEnrolled = {
  //     title: course.title,
  //     courseId: courseId,
  //   };

  //   await student.updateOne({ $push: { lessons: enrolledCourse } });
  //   await course.updateOne({ $inc: { enrollment: 1 } });

  //   res.status(201).json(student);
  // } catch (err) {
  //   console.log(err);
  // }
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

const getUserEnrolledCourses = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).send("Student not found");
    }

    const enrolledCourses = await Course.find({ enrolledStudents: studentId });
    res.status(200).json(enrolledCourses);
  } catch (err) {
    res.status(500).json("Server error");
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
  getCourse,
};
