const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const Student = require("../models/userModel");
const Course = require("../models/courseModel");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const client = SibApiV3Sdk.ApiClient.instance;
const { isValidObjectId } = require("mongoose");

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const createUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const isAlreadyExists = await Student.findOne({ email });

  if (isAlreadyExists)
    return res.status(400).json({ error: "Student already Exists" });

  const newUser = new Student({
    firstname,
    lastname,
    email,
    password: cryptoJs.AES.encrypt(password, process.env.PASS_SEC),
  });

  const sender = {
    email: process.env.EMAIL,
  };

  const receiver = [
    {
      email: email,
    },
  ];

  tranEmailApi
    .sendTransacEmail({
      sender,
      to: receiver,
      subject: "Welcome to Delx",
      htmlContent: `<div>Hi ${firstname} ${lastname}</div>`,
    })
    .then(() => {
      console.log("email sent");
      newUser.save();
      res.status(201).json({
        message: "Registration successful",
        status: "success",
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const isExistingUser = await Student.findOne({ email });
  !isExistingUser && res.status(401).json("Wrong Credentials !");
  const hashedGuy = cryptoJs.AES.decrypt(
    isExistingUser.password,
    process.env.PASS_SEC
  );
  const decryptedPassword = hashedGuy.toString(cryptoJs.enc.Utf8);

  if (decryptedPassword !== password) {
    res.status(401).json("Wrong Credentials!");
  } else {
    const accessToken = jwt.sign(
      {
        id: isExistingUser._id,
        role: isExistingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );
    //     const refreshToken = jwt.sign(
    //       {id: isExistingUser._id},
    //       process.env.REFRESH_SECRET,
    //       { expiresIn: "1d" }

    // )
    const { password, ...others } = isExistingUser._doc;

    res.status(200).json({
      status: "success",
      message: "Logged in successfully !",
      data: { ...others, accessToken },
    });
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24
    // })
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, password, role } = req.body;
  try {
    const updatedUser = await Student.findByIdAndUpdate(
      id,
      {
        $set: {
          firstname,
          lastname,
          email,
          password: cryptoJs.AES.encrypt(password, process.env.PASS_SEC),
          role,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(401).json({ error: "Invalid request" });
  }
  const user = await Student.findOne({ id });

  if (!user) return res.status(404).json({ error: "Student not found!" });

  res.status(200).json(user);
};

const getUsers = async (req, res) => {
  try {
    const users = await Student.find({}).sort({
      createdAt: -1,
    });
    const userCount = await Student.countDocuments();
    res.status(200).json({
      users,
      userCount,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const searchUser = async (req, res) => {
  const { firstname } = req.query;
  if (!firstname.trim())
    return res.status(401).json({ error: "Invalid request" });

  const users = await Student.find({
    firstname: { $regex: firstname, $options: "i" },
  });
  res.status(201).json(users);
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId))
    return res.status(401).json({ error: "Invalid request" });

  const user = await Student.findById(userId);
  if (!user) return res.status(404).json({ error: "Student not found!" });

  await User.findByIdAndDelete(userId);
  res.json({ message: "Student removed successfully !" });
};

const getUserEnrolledCourses = async (req, res) => {
  try{
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).send('Student not found');
    }

    const enrolledCourses = await Course.find({ enrolledStudents: studentId });
    res.status(200).json({
      status: 'success',
      message: 'Enrolled courses fetched successfully',
      data: enrolledCourses
    });

  }catch(err){
    res.status(500).json('Server error');
  }
}

module.exports = {
  createUser,
  loginUser,
  deleteUser,
  updateUser,
  getUsers,
  getSingleUser,
  searchUser,
  getUserEnrolledCourses
};
