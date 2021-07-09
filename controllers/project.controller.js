const { isValidObjectId } = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const ProjectModel = require("../models/project.model");
const UserModel = require("../models/user.model");
let userName, userFirstname = "";

const userInfo = async (id) => {
  UserModel.findById(id, (err, docs) => {
    if (!err) {
      userName = docs.name;
      userFirstname = docs.firstname;
    } else console.log("ID unknown : " + err);
  }).select("-password");
};

const addCom = async (id, text) => {
  await ProjectModel.findByIdAndUpdate(
    id,
    {
      $push: {
        comments: {
          text, //: `Creation of the project by ${userFirstname} ${userName}`,
          timestamp: Date.now(),
        },
      },
    },
    { upsert: true, new: true }
  );
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
    userInfo(creatorId);

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
          `Creation of the project by ${userFirstname} ${userName}`
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
      userInfo(updaterId);
      addCom(req.params.id, `Project uptdated by ${userFirstname} ${userName}`);
      res.status(201).json({ project: req.params.id });
    });

    // async () => {
    // UserModel.findById(updaterId, (err, docs) => {
    //   if(!err) {
    //     userName = docs.name
    //     userFirstname = docs.userFirstname
    //   }
    //   else console.log('ID unknown : ' + err);
    // }).select("-password")

    // await ProjectModel.findByIdAndUpdate(
    //   req.params.id,
    //   {
    //     $push : {
    //       comments : {
    //         text : `Project uptdated by ${userFirstname} ${userName}`,
    //         timestamp : Date.now()
    //         }
    //     }
    //   },
    //   { upsert: true, new: true }
    // )

    //res.status(201).json({project: req.params.id})
    //});
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
