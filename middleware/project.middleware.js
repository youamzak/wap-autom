const ProjectModel = require("../models/project.model");
const { isValidObjectId } = require("mongoose");

const controlCommentId = async (id, path) => {
  const json = `{ "${path}" : "${id}" }`;

  if (isValidObjectId(id) && (await ProjectModel.exists(JSON.parse(json))))
    return true;
  else return false;
};

module.exports.checkCommentId = async (req, res, next) => {
  if (req.body.idComment) {
    if (await controlCommentId(req.body.idComment, "comments._id")) 
      next();
    else {
      res.status(400).json("Comment ID unknown");
    }
  } else next();
};
