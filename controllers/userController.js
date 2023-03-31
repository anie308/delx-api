const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const createUser = async (req, res) => {
  const { firstname, lastname, email, password, isAdmin } = req.body;
  const isAlreadyExists = await User.findOne({ email });

  if (isAlreadyExists)
    return res.status(400).json({ error: "User already Exists" });

  const newAuth = new User({
    firstname,
    lastname,
    email,
    isAdmin,
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
      newAuth.save();
      res.status(201).json(newAuth);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

const loginAdmin = async (req, res) => {
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
        isAdmin: isExistingUser.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );
    const { password, ...others } = isExistingUser._doc;

    res.status(200).json({ ...others, accessToken });
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
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );
    const { password, ...others } = isExistingUser._doc;

    res.status(200).json({ ...others, accessToken });
  }
};

module.exports = {
  createUser,
  loginUser,
};
