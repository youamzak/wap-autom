const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");


const projectSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "errors:customerName.required"],
      minLength: [1, "Customer name must have at least 1 character"],
      maxLength: [55, "Customer name must have at most 55 characters"],
      trim: true,
    },
    numCommand: {
      type: String,
      required: [true, "Command number is required"],
      minLength: [1, "Command number must have at least 1 character"],
      maxLength: [55, "Command number must have at most 55 characters"],
      trim: true,
    },
    numMachine: {
      type: String,
      required: [true, "Machine number is required"],
      minLength: [1, "Machine number must have at least 1 character"],
      maxLength: [55, "Machine number must have at most 55 characters"],
      trim: true,
      unique: true,
    },
    numElecDraw: {
      type: String,
      required: [true, "Electrical draw number is required"],
      minLength: [1, "Electrical draw number must have at least 1 character"],
      maxLength: [55, "Electrical draw number must have at most 55 characters"],
      trim: true,
      unique: true,
    },
    customerLogo: {
      type: String,
      maxLength: 255,
    },
    machineDescription: {
      sector: String,
      designation: String,
      comment: String,
      materials: {
        type: [
          {
            id: String,
            material: String,
            brand: String,
            reference: String,
          },
        ],
      },
    },
    connectionDescription: {
      connectionMethod: String,
      connectionAccount: String,
      connectionLogin: String,
      connectionPassword: {
        type: String,
        maxLength: 1024,
      },
    },
    comments: {
      type: [
        {
          commenterId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
          text: { type: String, required: [true, "Text is required"] },
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

projectSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique.",
});

module.exports = mongoose.model("project", projectSchema);
