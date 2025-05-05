const controller = require('../controllers/characterController.js');
const itemController = require('../controllers/itemController.js');
const skillController = require('../controllers/skillController.js');
const userController = require("../controllers/userController.js");
const battleController = require("../controllers/battleController.js");
const express = require('express');
const { noContent } = require('../middlewares/status.js');
const { validatePositiveIntegerParam, validateFields } = require('../middlewares/validate');
const { calculateCharacterStats } = require('../middlewares/stats');
const { verifyToken } = require('../middlewares/auth.js');

const router = express.Router();

router.get('/', controller.readAllCharacter);
router.post('/',
    validateFields('name', 'element'),
    verifyToken,
    userController.readUserById,
    controller.createCharacter
);

router.use('/:character_id',
    validatePositiveIntegerParam('character_id'),
    controller.readCharacterById
);

router.get('/:character_id',
    calculateCharacterStats,
    controller.readCharacter
);

// router.put('/:character_id',
//     validateFields('user_id', 'name', 'mana', 'health', 'exp', 'element'),
//     controller.checkCharacterOwnership,
//     controller.updateCharacterById,
//     calculateCharacterStats,
//     controller.readCharacter
// );

router.post('/:character_id/recover',
    verifyToken,
    controller.checkCharacterOwnership,
    userController.readUserById,
    calculateCharacterStats,
    battleController.notInBattle,
    controller.recover
);

// skill management
router.get('/:character_id/skills', skillController.readOwnedSkills(false));
router.get('/:character_id/skills/detailed', skillController.readOwnedSkills(true));

router.post('/:character_id/skills',
    validateFields("skill_id"),
    verifyToken,
    controller.checkCharacterOwnership,
    userController.readUserById,
    skillController.readSkillById,
    skillController.checkSkillOwnership,
    skillController.purchaseSkill
);

// item management
router.get('/:character_id/items', itemController.readOwnedItems);

router.get('/:character_id/items/equipment', itemController.readEquipment);
router.get('/:character_id/items/equipment/:slot',
    itemController.readOwnedItemBySlot,
    itemController.readOwnedItem
);

router.use('/:character_id/items/:ownership_id',
    validatePositiveIntegerParam('ownership_id'),
    itemController.readOwnedItemById,
    itemController.checkOwner
);
router.get('/:character_id/items/:ownership_id', itemController.readOwnedItem);
router.post('/:character_id/items/:ownership_id/equip',
    verifyToken,
    controller.checkCharacterOwnership,
    itemController.equipItem,
    calculateCharacterStats,
    controller.clampHealth,
    noContent
);
router.post('/:character_id/items/:ownership_id/unequip',
    verifyToken,
    controller.checkCharacterOwnership,
    itemController.unequipItem,
    calculateCharacterStats,
    controller.clampHealth,
    noContent

);
router.post('/:character_id/items/:ownership_id/use',
    verifyToken,
    controller.checkCharacterOwnership,
    itemController.useItem,
    calculateCharacterStats,
    controller.clampHealth,
    noContent
);
router.delete('/:character_id/items/:ownership_id',
    verifyToken,
    controller.checkCharacterOwnership,
    itemController.deleteOwnedItem
);

router.get('/:character_id/battle',
    battleController.readBattleByCharacterId,
    battleController.extractCharacters,
    battleController.readBattle
);

module.exports = router;