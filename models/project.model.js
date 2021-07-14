const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 55,
      trim: true,
    },
    numCommand: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 55,
      trim: true,
    },
    numMachine: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 55,
      trim: true,
      unique: true,
    },
    numElecDraw: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 55,
      trim: true,
      unique: true,
    },
    machineDescription: {
        sector: String,
        designation: String,
        comment: String,
    },
    connectionDescription: {
        connectionMethod : String,
        connectionAccount : String,
        connectionLogin : String,
        connectionPassword: {
          type: String,
          minLength: 8,
          maxLength: 1024,
        },
      
    },
    comments: {
      type: [
        {
          commenterId: String,
          commenterName: String,
          commenterFirstname: String,
          text: String,
          timestamp: Number,
        },
      ],
      required: true,
    },
    files: {
      type: [
        {
          commenterId: String,
          commenterName: String,
          commenterFirstname: String,
          text: String,
          timestamp: Number,
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("project", projectSchema);
