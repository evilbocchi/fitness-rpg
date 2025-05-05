const express = require('express');
const { handleError } = require("../middlewares/handleError");
const userRoutes = require('./userRoutes');
const characterRoutes = require('./characterRoutes');
const challengeRoutes = require('./challengeRoutes');
const skillRoutes = require('./skillRoutes');
const battleRoutes = require('./battleRoutes');
const itemRoutes = require('./itemRoutes');
const dungeonRoutes = require('./dungeonRoutes');

const router = express.Router();

router.use("/users", userRoutes);
router.use("/character", characterRoutes);
router.use("/challenges", challengeRoutes);
router.use("/skills", skillRoutes);
router.use("/battle", battleRoutes);
router.use("/item", itemRoutes);
router.use("/dungeon", dungeonRoutes);

router.use(handleError);

module.exports = router;