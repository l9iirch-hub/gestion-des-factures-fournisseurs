const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const register = async (req, res) => {
  const { name, email, password, password_confirmation } = req.body;

  if (password !== password_confirmation) {
    return res
      .status(422)
      .json({ message: "Les mots de passe ne correspondent pas" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(422).json({ message: "Email déjà utilisé" });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res
    .status(201)
    .json({
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    createdAt: req.user.createdAt,
  });
};

module.exports = { register, login, getMe };
