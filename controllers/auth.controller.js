const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const maxAge = 3 * 86400 * 1000; //86400 = one day

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

module.exports.signUp = async (req, res) => {
  const { firstname, name, email, password } = req.body;

  try {
    const user = await UserModel.create({ firstname, name, email, password });
    res.status(201).json({ user: user._id });
  } catch (error) {
    res.status(200).send({ error });
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge });
    res.status(200).json({ user: user._id });
  } catch (error) {
    res.status(200).send({ error });
  }
};

module.exports.signOut = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({res : "Logged out"})
  //res.redirect("/");
};
