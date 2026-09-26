const { Interpretation, Product } = require("../models");

// Default curatorial prompts designed to spark critical thinking and creative response
const CURATOR_PROMPTS = [
  {
    id: 1,
    title: "The Decolonial Gaze in Miniatures",
    challenge: "In traditional miniature painting, kings and conquerors held center stage. How do modern Wasli artists subvert power dynamics to tell today's social reality?",
    curatorNote: "Critique by Curator Raza Ali: 'Notice the hyper-detailed borderwork containing barbed wire instead of classic floral vines.'",
    artworkId: 1
  },
  {
    id: 2,
    title: "Truck Art as Street Sovereignty",
    challenge: "Is Pakistani truck art merely vehicular adornment, or is it a mobile democratic museum for the working class? Share your reflection or a visual sketch prompt.",
    curatorNote: "Reflect on how poetical couplets on rear bumpers articulate yearning, exile, and devotion.",
    artworkId: 2
  },
  {
    id: 3,
    title: "Indus Clay & Collective Amnesia",
    challenge: "Harappan terracotta pottery was excavated millennia ago. What does contemporary pottery in Cholistan and Sindh tell us about the continuity of civilization?",
    curatorNote: "Look at the deliberate hairline crackles and salt glazes inspired by the lower Indus delta.",
    artworkId: 4
  }
];

// @desc Get active prompts and visitor reflections
// @route GET /api/community/prompts
const getPrompts = async (req, res, next) => {
  try {
    const recentInterpretations = await Interpretation.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [{ model: Product, as: "artwork", attributes: ["id", "title", "artist", "imageUrl"] }]
    });

    return res.json({
      success: true,
      prompts: CURATOR_PROMPTS,
      interpretations: recentInterpretations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Submit visitor interpretation or creative critique
// @route POST /api/community/interpretations
const submitInterpretation = async (req, res, next) => {
  try {
    const { artworkId, promptTitle, authorName, city, interpretationText } = req.body;

    if (!promptTitle || !authorName || !interpretationText) {
      return res.status(400).json({
        success: false,
        message: "Please include your name, the prompt/artwork title, and your critique/interpretation.",
      });
    }

    const interpretation = await Interpretation.create({
      artworkId: artworkId ? parseInt(artworkId, 10) : null,
      promptTitle: promptTitle.trim(),
      authorName: authorName.trim(),
      city: (city && city.trim()) || "Lahore",
      interpretationText: interpretationText.trim(),
      likes: 1,
    });

    return res.status(201).json({
      success: true,
      message: "Your interpretation has been pinned to the FISO Curatorial Wall. Thank you for contributing to the discourse.",
      interpretation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Like a visitor interpretation
// @route POST /api/community/interpretations/:id/like
const likeInterpretation = async (req, res, next) => {
  try {
    const interpretation = await Interpretation.findByPk(req.params.id);
    if (!interpretation) {
      return res.status(404).json({ success: false, message: "Interpretation not found." });
    }

    interpretation.likes += 1;
    await interpretation.save();

    return res.json({
      success: true,
      likes: interpretation.likes,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPrompts,
  submitInterpretation,
  likeInterpretation,
};
