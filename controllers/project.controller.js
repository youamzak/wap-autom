const { isValidObjectId } = require("mongoose");
const ProjectModel = require("../models/project.model");
const UserModel = require("../models/user.model");
const { addProjectError } = require("../errors/project.errors");
const CryptoJS = require('crypto-js')

const encrypt = (text, token) => {
  return CryptoJS.AES.encrypt(text, token).toString()
}

const decrypt = (text, token) => {
  const bytes = CryptoJS.AES.decrypt(text, token)
  return bytes.toString(CryptoJS.enc.Utf8)
}

const addCom = async (idProject, idUser, text) => {
  await UserModel.findById(idUser, (err, docs) => {
    if (err) {
      console.log("ID unknown : " + err);
    }
  })
    .select("-password")
    .then(async (req, res) => {
      await ProjectModel.findByIdAndUpdate(
        idProject,
        {
          $push: {
            comments: {
              commenterId: req._id,
              commenterName: req.name,
              commenterFirstname: req.firstname,
              text: text,
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
    connectionMethod,
    connectionAccount,
    connectionLogin,
    connectionPassword,
  } = req.body;

  try {
    const project = await ProjectModel.create(
      {
        clientName,
        numElecDraw,
        numCommand,
        numMachine,
        machineDescription: {
          sector,
          designation,
          comment,
        },
        connectionDescription: {
          connectionMethod,
          connectionAccount,
          connectionLogin,
          connectionPassword : encrypt(connectionPassword,process.env.TOKEN_CRYPT),
        },
      },
      (err, docs) => {
        if (!err) {
          addCom(docs._id, creatorId, "Creation of the project by");
          res.status(201).json({ res: docs });
        } else {
          res.status(200).json({ res: addProjectError(err) });
        }
      }
    );
  } catch (error) {
    res.status(200).json({ res: error.toString() });
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
    connectionMethod,
    connectionAccount,
    connectionLogin,
    connectionPassword,
  } = req.body;

  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      try {
        return ProjectModel.findByIdAndUpdate(req.params.id, {
          clientName,
          numElecDraw,
          numCommand,
          numMachine,
          machineDescription: {
            sector,
            designation,
            comment,
          },
          connectionDescription: {
            connectionMethod,
            connectionAccount,
            connectionLogin,
            connectionPassword : encrypt(connectionPassword,process.env.TOKEN_CRYPT),
          },
        }).then((err, docs) => {
            addCom(req.params.id, updaterId, "Project updated by");

            res.status(201).json({ res: docs });
          
        }).catch((error)=>{
          res.status(201).json({ res: error });
        })
      } catch (error) {
        res.status(200).json({ res: error });
      }
    }
  });
};

module.exports.removeProject = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      return ProjectModel.findByIdAndRemove(req.params.id, (err, docs) => {
        if (!err) return res.status(200).json({ res: "done" });
        else return res.status(201).json({ res: err });
      });
    }
  });
};

module.exports.getProject = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      return ProjectModel.findById(req.params.id, (err, docs) => {
        if (!err) return res.status(200).json({ res: docs });
        else return res.status(201).json({ res: err });
      });
    }
  });
};

module.exports.getAllProjectLight = async (req, res) => {
  const projects = 
    await ProjectModel.find()
    .select("-machineDescription")
    .select("-connectionDescription")
    .select("-comments");
    /*
    .select("-connectionDescription.connectionAccount")
    .select("-connectionDescription.connectionLogin")
    .select("-connectionDescription.connectionPassword");*/
  return res.status(200).json({ res: projects });
};

module.exports.getAllProjectFull = async (req, res) => {
  const projects = 
    await ProjectModel.find()
    .select("-connectionDescription.connectionAccount")
    .select("-connectionDescription.connectionLogin")
    .select("-connectionDescription.connectionPassword");
  return res.status(200).json({ res: projects });
};

module.exports.getPasswordConnection = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      return ProjectModel.findById(req.params.id, (err, docs) => {
        if (!err) {
          return res.status(200).json({ res: {
            account : docs.connectionDescription.connectionAccount,
            login : docs.connectionDescription.connectionLogin,
            password : decrypt(docs.connectionDescription.connectionPassword, process.env.TOKEN_CRYPT) }}
            );
        }
        else return res.status(201).json({ res: err });
      });
    }
  });
};

module.exports.addComment = (req, res) => {

  addCom(req.params.id, req.body.userId, req.body.text);
  if(!req.body.lock) //Only from upload file request. Used not to send the response twice
    return res.status(201).send({ res: "done" });
};

module.exports.updateComment = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      return ProjectModel.findById(
        req.params.id,
        (err, docs) => {
          const commToUpd = docs.comments.find((comment) => 
            comment._id.equals(req.body.idComment)
          )

          if (!commToUpd) return res.status(404).json({res : "Comment not found"})
          commToUpd.text = req.body.text

          return docs.save((err) => {
            if (!err) return res.status(200).json({res : docs})
            else return res.status(500).json({res : err})
          })
        }
      );
    }
  });
};

module.exports.removeComment = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      return ProjectModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            comments: {
              _id: req.body.idComment,
            },
          },
        },
        { new: true },
        (err, docs) => {
          if (!err) return res.status(200).json({ res: docs });
          else return res.status(200).json({ res: err });
        }
      );
    }
  });
};

module.exports.getComment = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      return ProjectModel.findById(
        req.params.id,
        (err, docs) => {
          const commToRead = docs.comments.find((comment) => 
            comment._id.equals(req.body.idComment)
          )

          if (!commToRead) 
            return res.status(404).json({res : "Comment not found"})

          res.status(200).json({res : commToRead})

        }
      );
    }
  });
};

module.exports.getAllComment = async (req, res) => {
  await ProjectModel.findById(req.params.id, (err, docs) => {
    if (err || !docs) {
      // Control if the id of the project exists
      return res.status(400).json({ res: "Project unknown" });
    } else {
      return ProjectModel.findById(
        req.params.id,
        (err, docs) => {
          
          res.status(200).json({res : docs.comments})

        }
      );
    }
  });
};

