const UserModel = require('../models/user.model')

module.exports.signUp = async (req, res) => {
  const {firstname, name, email, password} = req.body

  try {
    const user = await UserModel.create({firstname, name, email, password})
    res.status(201).json({user: user._id})
  } catch (error) {
    res.status(200).send({error})
  }
}