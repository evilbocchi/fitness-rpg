const { selectOne } = require("../middlewares/selection.js");
const { ensureDeleteById, updateAndSelectById } = require("../middlewares/byId.js");
const model = require("../models/characterModel.js");
const userModel = require("../models/userModel.js");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Reads all characters and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readAllCharacter = (req, res, next) => {
    model.selectAll((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware that retrieves the specified character and attaches it to the response locals.
 */
module.exports.readCharacterById = selectOne(model.selectById, "character");

/**
 * Reads the specified character and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readCharacter = (req, res, next) => res.status(200).json(res.locals.character);

/**
 * Creates a new character.
 * If the specified user already owns a character, a fee of 500 skillpoints is charged.
 * Sends a 201 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createCharacter = (req, res, next) => {
    const inserted = (error, results) => {
        if (error)
            return next(error);

        res.status(201).json(results[1][0]);
    }

    model.selectByUser(res.locals, (error, results) => {
        if (error)
            return next(error);

        if (results.length > 0) {
            const user = res.locals.user;
            const required = 500;
            if (user.skillpoints < required)
                return res.status(403).json({
                    message: `${user.username} does not have sufficient skillpoints to create another character!`,
                    current: user.skillpoints,
                    cost: required
                });

            user.skillpoints -= required;

            userModel.updateById(user, (error) => {
                if (error)
                    return next(error);
                model.insertSingle(res.locals, inserted);
            });
        }
        else
            model.insertSingle(res.locals, inserted);
    });
}

/**
 * Reads the characters owned by the specified user and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readCharacterByUserId = (req, res, next) => {
    model.selectByUser(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware that updates the specified character and attaches the updated character to the response locals.
 */
module.exports.updateCharacterById = updateAndSelectById(model, "Character not found.", "character");

/**
 * Middleware that verifies that the user is the owner of the specified character.
 * Checks if the `user_id` in the request body matches the `user_id` of the character.
 * Sends a 403 response if the user is not the owner.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.checkCharacterOwnership = (req, res, next) => {
    if (res.locals.character.user_id !== res.locals.user_id)
        return res.status(403).json({ message: "user_id must be the same as the character's user_id" });
    next();
}

/**
 * Middleware that recovers the specified character's health and mana to their maximum values.
 * Sends a 200 response with the updated character if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.recover = (req, res, next) => {
    const user = res.locals.user;
    const current = user.skillpoints;
    const cost = 25;

    if (user.skillpoints < cost)
        return res.status(403).json({
            message: `${user.username} does not have sufficient skillpoints.`,
            current: current,
            cost: cost
        });
    user.skillpoints -= cost;

    const recoverCharacter = () => {
        const character = res.locals.character;
        character.health = character.max_health;
        character.mana = character.max_mana;

        model.updateById(character, (error) => {
            if (error)
                return next(error);

            res.status(200).json({
                message: `Recovered ${character.name}!`,
                new_skillpoints: user.skillpoints,
                cost: cost
            });
        });
    }

    userModel.updateById(user, (error) => {
        if (error)
            return next(error);
        recoverCharacter();
    });
}


/**
 * Middleware that clamps a character's health to its maximum health if exceeding.
 * Used after equipping or other health-related operations to ensure health does not exceed maximum health.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.clampHealth = (req, res, next) => {
    const character = res.locals.character;
    if (character.health > character.max_health) {
        character.health = character.max_health;
        model.updateById(character, (error) => {
            if (error)
                return next(error);

            next();
        });
    }
    else {
        next();
    }
}