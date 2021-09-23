const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt = require('bcrypt')
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Firstname is required"],
      minLength: [1, "Firstname must have at least 1 character"],
      maxLength: [55, "Firstname must have at most 55 characters"],
      trim: true
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: [1, "Name must have at least 1 character"],
      maxLength: [55, "Name must have at most 55 characters"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [isEmail, "Email address is not correct"],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Name must have at least 8 character"],
      max: 1024
    },
    service: {
      type: String
    },
    group: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

// Encryption of the password before saving into the DB
userSchema.pre("save", async function(next){
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({email})
  if(user){
    const auth = await bcrypt.compare(password, user.password)
    if(auth) 
      return user
    throw Error('Incorrect Password')
  }
  throw Error('Incorrect email')
}

userSchema.plugin(uniqueValidator, {message : "Error, expected {PATH} to be unique."});

const UserModel = mongoose.model("user", userSchema)

module.exports = UserModel