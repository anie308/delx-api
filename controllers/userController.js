const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Student = require("../models/studentModel");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const client = SibApiV3Sdk.ApiClient.instance;
const { isValidObjectId } = require("mongoose");

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const createUser = async (req, res) => {
  const { firstname, lastname, email, password, role } = req.body;
  const isAlreadyExists = await User.findOne({ email });

  if (isAlreadyExists)
    return res.status(400).json({ error: "User already Exists" });

  const newAuth = new User({
    firstname,
    lastname,
    email,
    role,
    password: cryptoJs.AES.encrypt(password, process.env.PASS_SEC),
  });

  const newStudent = new Student({
    firstname,
    lastname,
    email,
  });
  const sender = {
    email: process.env.EMAIL,
  };

  const receiver = [
    {
      email: email,
    },
  ];

  if (role === "user") {
    tranEmailApi
      .sendTransacEmail({
        sender,
        to: receiver,
        subject: "Welcome to Delx",
        htmlContent: `<div>Hi ${firstname} ${lastname}</div>`,
      })
      .then(() => {
        console.log("email sent");
        newAuth.save();
        if (role === "user") newStudent.save();
        res.status(201).json(newAuth);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  } else {
    newAuth.save();
    res.status(201).json(newAuth);
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const isExistingUser = await User.findOne({ username });
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
    const { password, ...others } = isExistingUser._doc;

    res.status(200).json({ ...others, accessToken });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, password, role } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
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
  const user = await User.findOne({ id });

  if (!user) return res.status(404).json({ error: "User not found!" });

  res.status(200).json(user);
};

const getUsers = async (req, res) => {
 try{
  const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
  res.status(200).json(users);
 }catch(err){
  res.status(500).json(err)
 }

};

const searchUser = async (req, res) => {
  const { firstname } = req.query;
  if (!firstname.trim())
    return res.status(401).json({ error: "Invalid request" });

  const users = await User.find({
    firstname: { $regex: firstname, $options: "i" },
  });
  res.status(201).json(users);
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId))
    return res.status(401).json({ error: "Invalid request" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found!" });

  await User.findByIdAndDelete(userId);
  res.json({ message: "Course removed successfully !" });
};

module.exports = {
  createUser,
  loginUser,
  deleteUser,
  updateUser,
  getUsers,
  getSingleUser,
  searchUser,
};
