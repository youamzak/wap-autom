const { isValidObjectId } = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const ProjectModel = require("../models/project.model");
const UserModel = require("../models/user.model");

const addCom = async (idProject,idUser, text) => { 
  
  await UserModel.findById(idUser, (err, docs) => {
    
    if (err) {
      console.log("ID unknown : " + err)    
    }
  }).select("-password").then(async (req, res) => {
    await ProjectModel.findByIdAndUpdate(
      idProject,
      {
        $push: {
          comments: {
            text : `${text} ${req.name} ${req.firstname}`, 
            timestamp: Date.now(),
          },
        },
      },
      { upsert: true, new: true }
    );
  });

 
};

module.exports.addProject = async (req, res) => {
  const {
    clientName,
    numElecDraw,
    numCommand,
    numMachine,
    sector,
    designation,
    comment,
    creatorId,
  } = req.body;

  try {
    const project = await ProjectModel.create(
      {
        infos: {
          clientName,
          numElecDraw,
          numCommand,
          numMachine,
          machineDescription: {
            sector,
            designation,
            comment,
          },
        },
      },
      (err, docs) => {
        addCom(
          docs._id,
          creatorId,
          'Creation of the project by'
        );

        res.status(201).json({ project: docs._id });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(200).send({ error });
  }
};

module.exports.updateProject = async (req, res) => {
  const {
    clientName,
    numElecDraw,
    numCommand,
    numMachine,
    sector,
    designation,
    comment,
    updaterId,
  } = req.body;

  try {
    return ProjectModel.findByIdAndUpdate(req.params.id, {
      infos: {
        clientName,
        numElecDraw,
        numCommand,
        numMachine,
        machineDescription: {
          sector,
          designation,
          comment,
        },
      },
    }).then(() => {
      addCom(req.params.id, updaterId, 'Project uptdated by')
      res.status(201).json({ res: "done"});
    });

  } catch (error) {
    res.status(200).send({ error });
  }
};

module.exports.removeProject = async (req, res) => {};

module.exports.addComment = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    // req.params.id = Id of the project
    return res.status(400).json({ error: "ID unknown : " + req.params.id });

  const { commenterId, commenterName, commenterFirstname, text } = req.body;

  try {
    return ProjectModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId,
            commenterName,
            commenterFirstname,
            text,
            timestamp: Date.now(),
          },
        },
      },
      { upsert: true, new: true },
      (err, docs) => {
        if (!err) {
          return res.status(201).send({ project: docs });
        } else {
          res.status(400).json({ error: err });
        }
      }
    );
  } catch (error) {
    res.status(400).json({ error });
  }
};

module.exports.updateComment = async (req, res) => {};

module.exports.removeComment = async (req, res) => {};

module.exports.addBackup = async (req, res) => {};
