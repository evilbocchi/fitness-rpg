const controller = require('../controllers/battleController.js');
const skillController = require('../controllers/skillController.js');
const characterController = require('../controllers/characterController.js');
const characterModel = require('../models/characterModel.js');
const userController = require('../controllers/userController.js');
const express = require('express');
const { validatePositiveIntegerParam, validateFields } = require('../middlewares/validate');
const { selectOne } = require('../middlewares/selection');
const { verifyToken } = require('../middlewares/auth.js');
const router = express.Router();

router.post('/request',
    verifyToken,
    validateFields("character_id", "username"),
    characterController.readCharacterById,
    characterController.checkCharacterOwnership,
    userController.readUserByUsername,
    controller.notInBattle,
    controller.requestBattle
);

router.use('/request/:request_id',
    validatePositiveIntegerParam("request_id"),
    controller.readRequestById
)

router.delete('/request/:request_id',
    validateFields("character_id"),
    verifyToken,
    characterController.readCharacterById,
    characterController.checkCharacterOwnership,
    controller.cancelRequest
);

router.use('/:battle_id',
    validatePositiveIntegerParam("battle_id"),
    controller.readBattleById
);

router.get('/:battle_id',
    controller.extractCharacters,
    controller.readBattle
);

router.post('/',
    validateFields("attacker_id", "defender_id"),
    selectOne((locals, callback) => characterModel.selectById({ character_id: locals.attacker_id }, callback), "attacker"),
    selectOne((locals, callback) => characterModel.selectById({ character_id: locals.defender_id }, callback), "defender"),
    controller.notInBattle,
    controller.startPvP
);

router.post('/:battle_id/skill',
    validateFields("skill_id"),
    verifyToken,
    skillController.readSkillById,
    skillController.readSkillEffectsById,
    controller.extractCharacters,
    controller.checkSkillOwnership,
    controller.runTurn,
    controller.runActiveSkill,
    controller.runMonster,
    controller.applyChanges,
);

router.post('/:battle_id/guard',
    verifyToken,
    controller.extractCharacters,
    controller.runTurn,
    controller.guard,
    controller.runMonster,
    controller.applyChanges,
);

router.post('/:battle_id/forfeit',
    verifyToken,
    controller.extractCharacters,
    controller.runTurn,
    controller.forfeit,
    controller.applyChanges,
);

module.exports = router;