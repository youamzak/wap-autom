const ProjectModel = require('../models/project.model') 
const UserModel = require('../models/user.model')

module.exports.addProject = async (req, res) => {
  const { numElecDraw, numCommand, numMachine, sector, designation, comment } = req.body;

  try {
    const project = await ProjectModel.create({ 
      infos : {
        numElecDraw : numElecDraw, 
        numCommand : numCommand, 
        numMachine : numMachine, 
        machineDescription :{
          sector : sector, 
          designation : designation, 
          comment : comment
        }        
      }
    });

    res.status(201).json({project: project._id});
  } catch (error) {
    res.status(200).send({ error });
  }
}

module.exports.updateProject = async (res, req) => {
  
}

module.exports.removeProject = async (res, req) => {
  
}

module.exports.addComment = async (res, req) => {
  
}

module.exports.updateComment = async (res, req) => {
  
}

module.exports.removeComment = async (res, req) => {
  
}

module.exports.addBackup = async (res, req) => {
  
}
