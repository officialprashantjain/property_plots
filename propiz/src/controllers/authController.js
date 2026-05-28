const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: "1d" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
