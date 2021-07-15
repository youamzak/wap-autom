const ProjectModel = require("../models/project.model");
const UserModel = require("../models/user.model");
const fs = require("fs");

const moveFile = (oldFile, newFile) => {
  fs.rename(oldFile, newFile, (err, docs) => {
    if (!err) return "done" ;
    else return err.toString();
  });
};

module.exports.single = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      const path = `./uploads/${req.params.id}`;
      const fileNamePath = `./uploads/${req.file.filename}`;
      const fileName = req.file.filename;
      fs.stat(path, (err, stats) => {
        //Control if the folder exists. Note : fs.exists is deprecated
        if (!stats) {
          fs.mkdir(path, (err, docs) => {
            if (!err) {
              moveFile(fileNamePath, `${path}/${fileName}`);
              res.status(200).json({ res: "done" });
            } else res.status(200).json({ res: err });
          });
        } else {
          moveFile(fileNamePath, `${path}/${fileName}`);
          res.status(200).json({ res: "done" });
        }
      });
    }
  });
};

module.exports.multiple = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      const path = `./uploads/${req.params.id}`;
      
      fs.stat(path, (err, stats) => {
        //Control if the folder exists. Note : fs.exists is deprecated
        if (!stats) {
          fs.mkdir(path, (err, docs) => {
            if (err) console.log(err)
            else {
              req.files.forEach((file) => {
                let fileNamePath = `./uploads/${file.filename}`;
                let fileNameTmp = file.filename;
                moveFile(fileNamePath, `${path}/${fileNameTmp}`);
              });
              res.status(201).json({res : "done"})
            }
          });
        } else {
          req.files.forEach((file) => {
            let fileNamePath = `./uploads/${file.filename}`;
            let fileNameTmp = file.filename;
            moveFile(fileNamePath, `${path}/${fileNameTmp}`);
          });
          res.status(201).json({res : "done"})
        }
      });     
    }
  });
};

module.exports.remove = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      const fileToRemove = `./uploads/${req.params.id}/${req.body.filename}`;
      fs.rm(fileToRemove, (err, docs) => {
        if (!err) res.status(200).json({res : "done"})
        else res.status(200).json({res : `${req.body.filename} doesn't exist`})
      }) 
    }
  });

}