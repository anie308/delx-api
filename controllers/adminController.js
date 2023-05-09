const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const createAdmin = async (req, res) => {
  const { firstname, lastname, email, password, role } = req.body;
  const isAlreadyExists = await Admin.findOne({ email });

  if (isAlreadyExists)
    return res.status(400).json({ error: "Admin already Exists" });

  const newAuth = new Admin({
    firstname,
    lastname,
    email,
    role,
    password: cryptoJs.AES.encrypt(password, process.env.PASS_SEC),
  });

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: "Admin created successfully",
    data: newAuth,
  });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const isExistingUser = await Admin.findOne({ email });
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

    res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Admin logged in successfully",
      data: { ...others, accessToken },
    });
  }
};

const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, password, role } = req.body;
  try {
    const updatedUser = await Admin.findByIdAndUpdate(
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

module.exports = {
  createAdmin,
  loginAdmin,
  updateAdmin,
};
