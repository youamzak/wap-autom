const ProjectModel = require("../models/project.model");
const fs = require("fs");

const addCom = async (idProject, idUser, text) => {
  return await ProjectModel.findByIdAndUpdate(
    idProject,
    {
      $push: {
        comments: {
          commenterId: idUser,
          text: text,
          timestamp: Date.now(),
        },
      },
    },
    { upsert: true, new: true }
  )
    .select("-connectionDescription")
    .populate("comments.commenterId", "firstname name -_id")
    .exec()
    .then((docs) => {
      return { res: docs };
    })
    .catch((err) => {
      return { err: "Error addCom method" };
    });
};

const moveFile = (oldFile, newFile) => {
  fs.rename(oldFile, newFile, (err, docs) => {
    if (!err) return "done";
    else return err.toString();
  });
};

module.exports.single = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    const path = `./uploads/${req.params.id}`;
    const fileName = req.file.filename;
    const fileNamePath = `./uploads/${fileName}`;

    fs.stat(path, (err, stats) => {
      //Control if the folder exists. Note : fs.exists is deprecated
      if (!stats) {
        fs.mkdir(path, (err, docs) => {
          if (!err) {
            moveFile(fileNamePath, `${path}/${fileName}`);
          } else res.status(400).json("File not uploded");
        });
      } else {
        moveFile(fileNamePath, `${path}/${fileName}`);
      }
    });

    const response = await addCom(
      req.params.id,
      req.body.userId,
      `Upload of the file ${fileName}`
    );
    if (response.res) res.status(201).json(response.res);
    else res.status(400).json(response.err);
  }
};

module.exports.multiple = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    const path = `./uploads/${req.params.id}`;

    fs.stat(path, (err, stats) => {
      //Control if the folder exists. Note : fs.exists is deprecated
      if (!stats) {
        fs.mkdir(path, (err, docs) => {
          if (err) console.log(err);
          else {
            req.files.forEach(async (file) => {
              let fileNamePath = `./uploads/${file.filename}`;
              let fileName = file.filename;
              moveFile(fileNamePath, `${path}/${fileName}`);
              await addCom(
                req.params.id,
                req.body.userId,
                `Upload of the file ${fileName}`
              );
            });
            res.status(201).json("Files uploaded");
          }
        });
      } else {
        req.files.forEach(async (file) => {
          let fileNamePath = `./uploads/${file.filename}`;
          let fileName = file.filename;
          moveFile(fileNamePath, `${path}/${fileName}`);
          await addCom(
            req.params.id,
            req.body.userId,
            `Upload of the file ${fileName}`
          );
        });
        res.status(201).json("Files uploaded");
      }
    });
  }
};

module.exports.remove = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    const fileToRemove = `./uploads/${req.params.id}/${req.body.filename}`;
    fs.rm(fileToRemove, (err, docs) => {
      if (err) return res.status(400).json(`${req.body.filename} doesn't exist`);
    });

    const response = await addCom(
      req.params.id,
      req.body.userId,
      `Remove of the file ${req.body.filename}`
    );
    if (response.res) res.status(200).json(response.res);
    else res.status(400).json(response.err);
  }
};

module.exports.getFiles = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    const path = `./uploads/${req.params.id}`;
    fs.readdir(path, (err, files) => {
      res.status(200).json(files);
    });
  }
};
