const router = require("express").Router();
const projectController = require("../controllers/project.controller");
const ProjectModel = require("../models/project.model");
const { isValidObjectId } = require("mongoose");
const { checkCommentId } =require("../middleware/project.middleware")

router.param("id", async (req, res, next, id) => {
  if (isValidObjectId(id)){
    await ProjectModel.findById(id)
    .then((docs) => {
      if(!docs)
        return res.status(400).json("Id doesn't exist")
      next()
    })
    .catch(console.log)
  }else{
    return res.status(400).json("Id incorrect");
  }
  
});

router.post("/addProject", projectController.addProject);
router.put("/updateProject/:id", projectController.updateProject);
router.delete("/removeProject/:id", projectController.removeProject);
router.get("/getProject/:id", projectController.getProject);
router.get("/getAllProject", projectController.getAllProject);
router.get("/getPasswordConnection/:id", projectController.getPasswordConnection);

router.patch("/addComment/:id", checkCommentId, projectController.addComment);
router.patch("/updateComment/:id", checkCommentId, projectController.updateComment);
router.patch("/removeComment/:id", checkCommentId, projectController.removeComment);
router.get("/getComment/:id", checkCommentId, projectController.getComment);
router.get("/getAllComment/:id", checkCommentId, projectController.getAllComment);

module.exports = router;
