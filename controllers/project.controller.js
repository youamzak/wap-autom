const { isValidObjectId } = require("mongoose");
const ProjectModel = require("../models/project.model");
const UserModel = require("../models/user.model");
const { addProjectError } = require("../errors/project.errors");
const CryptoJS = require("crypto-js");

const encrypt = (text, token) => {
  return CryptoJS.AES.encrypt(text, token).toString();
};

const decrypt = (text, token) => {
  const bytes = CryptoJS.AES.decrypt(text, token);
  return bytes.toString(CryptoJS.enc.Utf8);
};

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
    .exec()
    .then((docs) => {
      return { res: docs };
    })
    .catch((err) => {
      return { err: "Error addCom method" };
    });
};

module.exports.addProject = async (req, res) => {
  const {
    customerName,
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
  const project = await ProjectModel.create({
    customerName,
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
      connectionPassword: connectionPassword
        ? encrypt(connectionPassword, process.env.TOKEN_CRYPT)
        : "",
    },
  })
    .then(async (docs) => {
      const response = await addCom(
        docs._id,
        creatorId,
        "Creation of the project"
      );
      if (response.res) res.status(201).json(response.res);
      else res.status(400).json(response.err);
    })
    .catch((err) => res.status(400).json("Error : addProject function"));
};

module.exports.updateProject = async (req, res) => {
  if (res.statusCode !== 400) {
    const {
      customerName,
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

    return await ProjectModel.findByIdAndUpdate(req.params.id, {
      customerName,
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
        connectionPassword: encrypt(
          connectionPassword,
          process.env.TOKEN_CRYPT
        ),
      },
    })
      .then(async (docs) => {
        console.log(docs);
        const response = await addCom(
          req.params.id,
          updaterId,
          "Project updated by"
        );
        if (response.res) res.status(201).json(response.res);
        else res.status(400).json(response.err);
      })
      .catch((err) => res.status(400).json("Error : updateProject function"));
  }
};

module.exports.removeProject = async (req, res) => {
  if (res.statusCode !== 400) {
    return await ProjectModel.findByIdAndRemove(req.params.id)
      .then((docs) => {
        return res.status(200).json("The project has been removed");
      })
      .catch((err) => res.status(400).json("Error : removeProject function"));
  }
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
  const projects = await ProjectModel.find()
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
  const projects = await ProjectModel.find()
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
          return res.status(200).json({
            res: {
              account: docs.connectionDescription.connectionAccount,
              login: docs.connectionDescription.connectionLogin,
              password: decrypt(
                docs.connectionDescription.connectionPassword,
                process.env.TOKEN_CRYPT
              ),
            },
          });
        } else return res.status(201).json({ res: err });
      });
    }
  });
};

module.exports.addComment = async (req, res) => {
  if (res.statusCode !== 400) {
    const response = await addCom(
      req.params.id,
      req.body.userId,
      req.body.text
    );
    if (response.res) res.status(201).json(response.res);
    else res.status(400).json(response.err);
  }
};

module.exports.updateComment = async (req, res) => {
  if (res.statusCode !== 400) {
    await ProjectModel.findById(req.params.id)
      .select("comments")
      .populate("comments.commenterId", "firstname name -_id")
      .exec()
      .then((docs) => {
        const commToUpd = docs.comments.id(req.body.idComment);
        if (!commToUpd)
          return res.status(400).json({ res: "Comment not found" });
        commToUpd.text = req.body.text;

        return docs.save((err) => {
          if (!err) return res.status(201).json(docs);
          else return res.status(400).json("Update comment error");
        });
      })
      .catch((err) => res.json("Error : updateComment function"));
  }
};

module.exports.removeComment = async (req, res) => {
  if (res.statusCode !== 400) {
    await ProjectModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.idComment,
          },
        },
      },
      { new: true }
    )
      .then((docs) => {
        res.json({ res: docs });
      })
      .catch((err) => res.status(400).json("Error : removeComment function"));
  }
};

module.exports.getComment = async (req, res) => {
  if (res.statusCode !== 400) {
    await ProjectModel.findById(req.params.id)
      .select("comments")
      .populate("comments.commenterId", "firstname name -_id")
      .exec()
      .then((docs) => {
        res.json({ res: docs.comments.id(req.body.idComment) });
      })
      .catch((err) => res.status(400).json("Error : getComment function"));
  }
};

module.exports.getAllComment = async (req, res) => {
  if (res.statusCode !== 400) {
    await ProjectModel.findById(req.params.id)
      .select("comments")
      .populate("comments.commenterId", "firstname name -_id")
      .exec()
      .then((docs) => res.json(docs.comments))
      .catch((err) => res.status(400).json("Error : getAllComment function"));
  }
};
