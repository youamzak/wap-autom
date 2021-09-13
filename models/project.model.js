const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    customerName: {
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
    customerLogo: {
      type: String,
      maxLength: 255
    },
    machineDescription: {
        sector: String,
        designation: String,
        comment: String,
        materials: {
          type : [
            {
              id: String,
              material: String,
              brand: String,
              reference: String
            }
          ]
        }
    },
    connectionDescription: {
        connectionMethod : String,
        connectionAccount : String,
        connectionLogin : String,
        connectionPassword: {
          type: String,
          maxLength: 1024,
        },
      
    }, 
    comments: {
      type: [
        {
          commenterId: {type : mongoose.Schema.Types.ObjectId, ref:"user"},
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

// comments: {
//   type: [
//     {
//       commenterId: String,
//       commenterName: String,
//       commenterFirstname: String,
//       text: String,
//       timestamp: Number,
//     },
//   ],
//   required: true,
// },

module.exports = mongoose.model("project", projectSchema);
