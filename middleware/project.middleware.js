const ProjectModel = require("../models/project.model");
const { isValidObjectId } = require("mongoose");

const controlProjectId = async (id, path) => {
  const json = `{ "${path}" : "${id}" }`;

  if (isValidObjectId(id) && (await ProjectModel.exists(JSON.parse(json))))
    return true;
  else return false;
};

module.exports.checkProjectIds = async (req, res, next) => {
  if (req.statusCode !== 400 || req.statusCode !== 401) {
    if (await controlProjectId(req.params.id, "_id")) {
      //Control idComment for request getComment
      if (req.body.idComment) {
        if (await controlProjectId(req.body.idComment, "comments._id")) next();
        else {
          res.status(400).json("Comment ID unknown");
          next();
        }
      } else next();
      //*****/
    } else {
      res.status(400).json("Project ID unknown");
      next();
    }
  }
};

