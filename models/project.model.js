const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      minlenght: 1,
      max: 55,
      trim: true
    },
    numCommand: {
      type: String,
      required: true,
      minlenght: 1,
      max: 55,
      trim: true
    },
    numMachine: {
      type: String,
      required: true,
      minlenght: 1,
      max: 55,
      trim: true,
      unique: true
    },
    numElecDraw: {
      type: String,
      required: true,
      minlenght: 1,
      max: 55,
      trim: true,
      unique: true
    },
    infos: {
      type: 
        {
          machineDescription: {
            sector: String,
            designation: String,
            comment: String,
          },
          connectionDescription: {
            connectionMethod: String,
            connectionAccount: String,
            connectionLogin: String,
            connectionPassword: String
          }
        }
      ,
      required: true
    },
    comments: {
      type: [
        {
          commenterId: String,
          commenterName: String,
          commenterFirstname: String,
          text: String,
          timestamp: Number
        }
      ],
      required: true
    },
    backUp: {
      type: [
        {
          commenterId: String,
          commenterName: String,
          commenterFirstname: String,
          text: String,
          timestamp: Number
        }
      ],
      required: true
    },
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("project", projectSchema)