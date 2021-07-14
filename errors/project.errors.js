module.exports.addProjectError = (err) => {
  let keyPattern = "";
  let keyValue = "";
  let errorMessage = "";

  if (err.toString().toLowerCase().includes("password")) { //Control error type
    keyPattern = "password";
  } else {
    keyPattern = Object.keys(err.keyPattern)[0]; //Id
    keyValue = Object.values(err.keyValue)[0]; //Value of the entry
  }

  switch (keyPattern) {
    case ("clientName"):
      errorMessage = `Error Name Customer: ${keyValue} is too short or empty`;
      break;
    case ("numCommand"):
      errorMessage = `Error Command Number: ${keyValue} is too short or empty`;
      break;
    case ("numMachine"):
      errorMessage = `Error Machine Number: ${keyValue} is already used or the length is wrong`;
      break;
    case ("numElecDraw"):
      errorMessage = `Error Electrical Draw: ${keyValue} is already used or the length is wrong`;
      break;
    case "password":
      errorMessage = `Error : the password is too short or empty`;
      break;
    default:
      errorMessage = `Error : ${err.code}`;
      break;
  }

  return errorMessage
};
