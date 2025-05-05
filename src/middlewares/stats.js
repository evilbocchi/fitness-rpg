const { getMaxExp, getLevel } = require('../configs/levelFormula');
const itemOwnershipModel = require('../models/itemOwnershipModel');

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Middleware that calculates the stats of the specified character.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function. 
 */
module.exports.calculateCharacterStats = (req, res, next) => {
    const character = res.locals.character;
    const level = getLevel(character.exp);
    character.max_exp = getMaxExp(level);
    character.level = level;

    let maxHealth = 100;
    let power = 0;
    
    itemOwnershipModel.selectEquipmentByCharacterId({
        character_id: character.character_id
    }, (error, results) => {
        if (error)
            return next(error);

        for (const item of results) {
            const slot = item.slot.toLowerCase();
            let effectivePower = item.power;
            if (item.element == character.element) { // same element bonus
                effectivePower *= 1.25;
            }

            switch (slot) {
                case "weapon":
                    power += effectivePower;
                    break;
                case "helmet":
                case "chestplate":
                case "leggings":
                case "boots":
                    maxHealth += effectivePower;
                    break;
            }
        }

        character.max_mana = 40 + level * 10;
        character.max_health = maxHealth;
        character.power = power;
        next();
    });
}