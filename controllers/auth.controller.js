const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const maxAge = 3 * 86400 * 1000; //86400 = one day

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

const func_error = (error) => {
  let errorMessages = {};

  if (error.errors.password)
    errorMessages.passwordError = error.errors.password.message;

  if (error.errors.name) errorMessages.nameError = error.errors.name.message;

  if (error.errors.firstname)
    errorMessages.firstnameError = error.errors.firstname.message;

  if (error.errors.email) errorMessages.emailError = error.errors.email.message;

  return errorMessages;
};

module.exports.signUp = async (req, res) => {
  const { firstname, name, email, password } = req.body;

  await UserModel.create({ firstname, name, email, password })
    .then((docs) => {
      res.status(201).json(docs._id);
    })
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.login(email, password)
    .then((docs) => {
      const token = createToken(docs._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge });
      res.status(200).json(docs._id);
    })
    .catch((err) => res.status(400).json(err));
};

module.exports.signOut = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({ res: "Logged out" });
  //res.redirect("/");
};
