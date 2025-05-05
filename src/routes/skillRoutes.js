const controller = require('../controllers/skillController');
const express = require('express');
const { validatePositiveIntegerParam, validateFields } = require('../middlewares/validate');
const router = express.Router();


router.get('/', controller.readAllSkill);

router.get('/ownerships', controller.readAllSkillOwnerships);

router.use('/:skill_id',
    validatePositiveIntegerParam("skill_id"),
    controller.readSkillById
);

// router.post('/',
//     validateFields("name", "description", "skillpoint_purchase_cost", "element", "accuracy", "damage", "mana_cost"),
//     controller.notExistingName,
//     controller.validateSkill,
//     controller.createSkill
// );

router.get('/:skill_id', controller.readSkill);

// router.put('/:skill_id',
//     validateFields("name", "description", "skillpoint_purchase_cost", "element", "accuracy", "damage", "mana_cost"),
//     controller.notExistingName,
//     controller.validateSkill,
//     controller.updateSkillById
// );

// router.get('/:skill_id/effects',
//     controller.readSkillEffectsById,
//     controller.readSkillEffects
// );

// router.post('/:skill_id/effects',
//     validateFields("effect_type", "effect_value", "effect_target", "duration"),
//     controller.createSkillEffect
// );

// router.use('/:skill_id/effects/:effect_id',
//     validatePositiveIntegerParam("effect_id"),
//     controller.readSkillEffectById,
//     controller.checkEffectIsInSkill
// );

// router.put('/:skill_id/effects/:effect_id',
//     validateFields("effect_type", "effect_value", "effect_target", "duration"),
//     controller.updateSkillEffectById
// );

// router.delete('/:skill_id/effects/:effect_id', controller.deleteSkillEffectById);

module.exports = router;