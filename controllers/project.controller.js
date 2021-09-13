const ProjectModel = require("../models/project.model");
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
    .populate("comments.commenterId", "firstname name -_id")
    .exec()
    .then((docs) => {
      return { res: docs };
    })
    .catch((err) => {
      return { err: "Error addCom method" };
    });
};

module.exports.addProject = async (req, res) => {
  if (res.statusCode !== 401) {
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
  }
};

module.exports.updateProject = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
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
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    return await ProjectModel.findByIdAndRemove(req.params.id)
      .then((docs) => {
        return res.status(200).json("The project has been removed");
      })
      .catch((err) => res.status(400).json("Error : removeProject function"));
  }
};

module.exports.getProject = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    return await ProjectModel.findById(req.params.id)
      .select("-connectionDescription")
      .populate("comments.commenterId", "firstname name -_id")
      .exec()
      .then((docs) => res.status(200).json(docs))
      .catch((err) => res.status(400).json("Error : getProject function"));
  }
};

module.exports.getAllProject = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    await ProjectModel.find()
      .select("-connectionDescription")
      .populate("comments.commenterId", "firstname name -_id")
      .exec()
      .then((docs) => {
        if (req.body.filter === "full") res.status(200).json(docs);
        else {
          const responses = [];
          docs.forEach((element) => {
            responses[responses.length] = {
              customerName: element.customerName,
              numCommand: element.numCommand,
              numMachine: element.numMachine,
              numElecDraw: element.numElecDraw,
            };
          });
          res.status(200).json(responses);
        }
      })
      .catch((err) => res.status(400).json("Error : getAllProject function"));
  }
};

module.exports.getPasswordConnection = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    return await ProjectModel.findById(req.params.id)
      .then((docs) => {
        const response = {
          method: docs.connectionDescription.connectionMethod,
          account: docs.connectionDescription.connectionAccount,
          login: docs.connectionDescription.connectionLogin,
          password: decrypt(
            docs.connectionDescription.connectionPassword,
            process.env.TOKEN_CRYPT
          ),
        };
        return res.status(200).json(response);
      })
      .catch((err) =>
        res.status(400).json("Error : getPasswordConnection function")
      );
  }
};

module.exports.addComment = async (req, res) => {
  if (res.statusCode !== 400 && res.statusCode !== 401) {
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
  if (res.statusCode !== 400 && res.statusCode !== 401) {
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
  if (res.statusCode !== 400 && res.statusCode !== 401) {
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
  if (res.statusCode !== 400 && res.statusCode !== 401) {
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
  if (res.statusCode !== 400 && res.statusCode !== 401) {
    await ProjectModel.findById(req.params.id)
      .select("comments")
      .populate("comments.commenterId", "firstname name -_id")
      .exec()
      .then((docs) => res.json(docs.comments))
      .catch((err) => res.status(400).json("Error : getAllComment function"));
  }
};
