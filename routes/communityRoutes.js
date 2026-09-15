const express = require("express");
const router = express.Router();
const {
  getPrompts,
  submitInterpretation,
  likeInterpretation,
} = require("../controllers/communityController");

router.get("/prompts", getPrompts);
router.post("/interpretations", submitInterpretation);
router.post("/interpretations/:id/like", likeInterpretation);

module.exports = router;
