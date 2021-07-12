const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 55,
      trim: true
    },
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxLength: 55,
      trim: true
    },
    email: {
      type: String,
      required: true,
      validate: [isEmail],
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
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

const UserModel = mongoose.model("user", userSchema)

module.exports = UserModel