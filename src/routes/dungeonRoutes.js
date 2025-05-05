const controller = require('../controllers/dungeonController');
const characterController = require('../controllers/characterController');
const battleController = require('../controllers/battleController');
const express = require('express');
const { validatePositiveIntegerParam, validateFields } = require('../middlewares/validate');
const { getRandomLoot } = require('../middlewares/lootTable');
const { calculateCharacterStats } = require('../middlewares/stats');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();


router.get('/', controller.readAllDungeon);

router.use('/:dungeon_id',
    validatePositiveIntegerParam("dungeon_id"),
    controller.readDungeonById
);

// router.post('/',
//     validateFields("name", "req"),
//     controller.createDungeon
// );

router.get('/:dungeon_id', controller.readDungeon);

router.post('/:dungeon_id/explore',
    validateFields("character_id"),
    characterController.readCharacterById,
    verifyToken,
    characterController.checkCharacterOwnership,
    battleController.notInBattle,
    calculateCharacterStats,
    controller.checkDungeonEntry,
    controller.calculateLootTable,
    getRandomLoot(Math.floor(Math.random() * 3) + 1),
    controller.runDungeon
);

// router.put('/:dungeon_id',
//     validateFields("name", "req"),
//     controller.updateDungeonById
// );

module.exports = router;