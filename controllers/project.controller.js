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
    { upsert: true, new: true, runValidators: true }
  )
    .select("-connectionDescription")
    .populate("comments.commenterId", "firstname name -_id")
    .exec()
    .then((docs) => {
      return { res: docs };
    })
    .catch((err) => {
      return { err: func_error(err) };
    });
};

const func_error = (error) => {
  let errorMessages = {};

  if (error.errors.customerName)
    errorMessages.customerNameError = error.errors.customerName.message;

  if (error.errors.numCommand)
    errorMessages.numCommandError = error.errors.numCommand.message;

  if (error.errors.numMachine)
    errorMessages.numMachineError = error.errors.numMachine.message;

  if (error.errors.numElecDraw)
    errorMessages.numElecDrawError = error.errors.numElecDraw.message;

  if (error.errors.customerLogo)
    errorMessages.customerLogoError = error.errors.customerLogo.message;

  if (error.errors.comments)
    errorMessages.commentsError = error.errors.comments.errors.text.message;

  return errorMessages;
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
  await ProjectModel.create({
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
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.updateProject = async (req, res) => {
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
      connectionPassword: encrypt(connectionPassword, process.env.TOKEN_CRYPT),
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
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.removeProject = async (req, res) => {
  return await ProjectModel.findByIdAndRemove(req.params.id)
    .then((docs) => {
      return res.status(200).json("The project has been removed");
    })
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.getProject = async (req, res) => {
  return await ProjectModel.findById(req.params.id)
    .select("-connectionDescription")
    .populate("comments.commenterId", "firstname name -_id")
    .exec()
    .then((docs) => res.status(200).json(docs))
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.getAllProject = async (req, res) => {
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
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.getPasswordConnection = async (req, res) => {
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
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.addComment = async (req, res) => {
  const response = await addCom(req.params.id, req.body.userId, req.body.text);
  if (response.res) res.status(201).json(response.res);
  else res.status(400).json(response.err);
};

module.exports.updateComment = async (req, res) => {
  await ProjectModel.findById(req.params.id)
    .select("comments")
    .populate("comments.commenterId", "firstname name -_id")
    .exec()
    .then((docs) => {
      const commToUpd = docs.comments.id(req.body.idComment);
      // if (!commToUpd) return res.status(400).json({ res: "Comment not found" });
      commToUpd.text = req.body.text;

      return docs.save((err) => {
        if (!err) return res.status(201).json(docs);
        else return res.status(400).json("Update comment error");
      });
    })
    .catch((err) => res.json(func_error(err)));
};

module.exports.removeComment = async (req, res) => {
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
      res.json(docs);
    })
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.getComment = async (req, res) => {
  await ProjectModel.findById(req.params.id)
    .select("comments")
    .populate("comments.commenterId", "firstname name -_id")
    .exec()
    .then((docs) => {
      res.json(docs.comments.id(req.body.idComment));
    })
    .catch((err) => res.status(400).json(func_error(err)));
};

module.exports.getAllComment = async (req, res) => {
  await ProjectModel.findById(req.params.id)
    .select("comments")
    .populate("comments.commenterId", "firstname name -_id")
    .exec()
    .then((docs) => res.json(docs.comments))
    .catch((err) => res.status(400).json(func_error(err)));
};
