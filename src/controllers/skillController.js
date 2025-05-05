const { updateAndSelectById, ensureDeleteById } = require("../middlewares/byId");
const skillOwnershipModel = require("../models/skillOwnershipModel");
const userModel = require("../models/userModel");
const effectModel = require("../models/effectModel");
const model = require("../models/skillModel");
const { selectOne, select } = require("../middlewares/selection");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {import('express').RequestHandler} RequestHandler
 */

/**
 * Reads all skill ownerships and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readAllSkillOwnerships = (req, res, next) => {
    skillOwnershipModel.selectAll((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware factory that reads skill ownerships related to the specified user and sends a 200 response.
 * 
 * @param {boolean} detailed Whether to send the full skill object or just the skill_id.
 * @returns {RequestHandler} The middleware function.
 */
module.exports.readOwnedSkills = (detailed) => (req, res, next) => {
    if (detailed) {
        skillOwnershipModel.selectDetailedByCharacterId(res.locals, (error, results) => {
            if (error)
                return next(error);

            res.status(200).json(results);
        });
        return;
    }

    skillOwnershipModel.selectByCharacterId(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results.map((ownership) => ownership.skill_id));
    });
}

/**
 * Reads all skills and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readAllSkill = (req, res, next) => {
    model.selectAll((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware that retrieves the specified skill and attaches it to the response locals.
 */
module.exports.readSkillById = selectOne(model.selectById, "skill");

/**
 * Reads the specified skill and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readSkill = (req, res, next) => res.status(200).json(res.locals.skill);

/**
 * Creates a new skill and sends a 201 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createSkill = (req, res, next) => {
    model.insertSingle(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(201).json(results[1][0]);
    });
}

/**
 * Updates the specified skill and sends a 200 response if successful.
 */
module.exports.updateSkillById = updateAndSelectById(model, "Skill not found.");

/**
 * Checks if the user has enough skillpoints to purchase the specified skill.
 * If true, subtracts the required skillpoint amount from the user's balance and adds a skill ownership record.
 * Sends a 201 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.purchaseSkill = (req, res, next) => {    
    const user = res.locals.user;
    const skill = res.locals.skill;
    let skillpoints = user.skillpoints;
    const cost = skill.skillpoint_purchase_cost;
    if (skillpoints < cost)
        return res.status(403).json({
            message: `Insufficient skillpoints to purchase ${skill.name}.`,
            current: skillpoints,
            cost: cost,
        });

    skillpoints -= cost;
    user.skillpoints = skillpoints;
    res.locals.cost = cost;

    userModel.updateById(user, (error) => {
        if (error)
            return next(error);

        skillOwnershipModel.insertSingle(res.locals, (error) => {
            if (error)
                return next(error);

            res.status(201).json({
                message: `Purchased ${skill.name}!`,
                cost: cost,
                remaining: skillpoints
            });
        });
    });
}

/**
 * Middleware that verifies that the skill is not owned by the character.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.checkSkillOwnership = (req, res, next) => {
    skillOwnershipModel.selectByIds(res.locals, (error, results) => {
        if (error)
            return next(error);
        if (results.length > 0)
            return res.status(409).json({ message: `${res.locals.character.name} already owns ${res.locals.skill.name}.` });
        next();
    });
}

/**
 * Middleware that validates that skill parameters are within range.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.validateSkill = (req, res, next) => {
    if (res.locals.accuracy < 0 || res.locals.accuracy > 100)
        return res.status(400).json({ message: "Accuracy must be within range 0-100." });

    next();
}

/**
 * Checks if the specified name in the response locals is already used by an existing row and that row
 * is not the same as the specified skill_id.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.notExistingName = (req, res, next) => {
    model.selectByName(res.locals, (error, results) => {
        if (error)
            return next(error);

        if (results.length == 0)
            return next();

        const existingSkill = results[0];

        if (existingSkill.name == res.locals.name && (res.locals.skill_id == undefined || existingSkill.skill_id != res.locals.skill_id))
            return res.status(409).json({ message: "Name already in use." });
        
        next();
    });
}

/**
 * Middleware that retrieves all effects related to the specified skill and attaches it to the response locals.
 */
module.exports.readSkillEffectsById = select(effectModel.selectBySkillId, "effects");

/**
 * Middleware that retrieves the specified effect and attaches it to the response locals.
 */
module.exports.readSkillEffectById = selectOne(effectModel.selectById, "effect");

/**
 * Reads the specified effects and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readSkillEffects = (req, res, next) => res.status(200).json(res.locals.effects);

/**
 * Creates a new skill effect and sends a 201 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createSkillEffect = (req, res, next) => {
    effectmodel.insertSingle(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(201).json(results[1][0]);
    });
}

/**
 * Updates the specified skill effect and sends a 200 response if successful.
 */
module.exports.updateSkillEffectById = updateAndSelectById(effectModel, "Effect not found.");

/**
 * Deletes the specified skill effect and sends a 200 response if successful.
 */
module.exports.deleteSkillEffectById = ensureDeleteById(effectModel, "Effect not found.");

/**
 * Middleware that checks if the specified effect is related to the specified skill.
 */
module.exports.checkEffectIsInSkill = (req, res, next) => {
    if (res.locals.skill_id != res.locals.effect.skill_id)
        return res.status(403).json({ message: "Effect does not belong to skill." });
    next();
}