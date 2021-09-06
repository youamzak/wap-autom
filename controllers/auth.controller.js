const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const maxAge = 3 * 86400 * 1000; //86400 = one day

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

const func_error = (error) => {
  let errorMessages = {
    nameError: '',
    firstnameError: '',
    passwordError: '',
    emailError:''
  }
  if(!error.code){
    
    if(error.errors.email){
      switch (error.errors.email.kind) {
        case "required":
          errorMessages.emailError = "Adresse email requise"
          break;
        case "user defined":
          errorMessages.emailError = "Adresse email incorrect"
          break;
        default:
          errorMessages.emailError = "Erreur sur l'adresse email"
          break;
      }
    }
      
    if(error.errors.password)
      errorMessages.passwordError = "Mot de passe trop court"
    
    if(error.errors.name)
    errorMessages.nameError = "Nom requis"
    
    if(error.errors.firstname)
    errorMessages.firstnameError = "Prénom requis"
  }else{
    if(error.keyValue.email)
      errorMessages.emailError = "Adresse existante"

  }
   return errorMessages
  
}

module.exports.signUp = async (req, res) => {
  const { firstname, name, email, password } = req.body;

  try {
    const user = await UserModel.create(
      { firstname, name, email, password },
      (err, docs) => {
        if(!err)
          res.status(201).json({ res: docs._id });
        else
          res.status(200).json({ error : func_error(err) });
  
      }
      )    
  } catch (err) {
    res.status(200).json({ error : func_error(err) });

  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, {httpOnly: false, maxAge, sameSite: true, secure : true}); 
    res.status(200).json({ user: user._id });
  } catch (error) {
    res.status(200).json({error : error.message});
  }
};

module.exports.signOut = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({res : "Logged out"})
  //res.redirect("/");
};


