const { updateAndSelectById, ensureDeleteById } = require("../middlewares/byId");
const itemOwnershipModel = require("../models/itemOwnershipModel");
const model = require("../models/itemModel");
const characterModel = require("../models/characterModel");
const { selectOne } = require("../middlewares/selection");
const { getLevel } = require("../configs/levelFormula");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Reads skill ownerships related to the specified user and sends a 200 response if successful.
 * The response body will be formatted as a number array.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readOwnedItems = (req, res, next) => {
    itemOwnershipModel.selectByCharacterId(res.locals, (error, results) => {
        if (error)
            return next(error);

        for (const result of results)
            delete result.character_id;

        res.status(200).json(results);
    });
}

/**
 * Reads all items and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readAllItem = (req, res, next) => {
    model.selectAll((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware that retrieves the specified item and attaches it to the response locals.
 */
module.exports.readItemById = selectOne(model.selectById, "item");

/**
 * Reads the specified item and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readItem = (req, res, next) => res.status(200).json(res.locals.item);

/**
 * Creates a new item and sends a 201 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createItem = (req, res, next) => {
    res.locals.effect_type = req.body.effect_type;
    res.locals.element = req.body.element;

    model.insertSingle(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(201).json(results[1][0]);
    });
}

/**
 * Updates the specified item and sends a 200 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.updateItemById = (req, res, next) => {
    res.locals.effect_type = req.body.effect_type;
    res.locals.element = req.body.element;
    updateAndSelectById(model, "Item not found.")(req, res, next);
};

/**
 * Middleware that retrieves the specified item ownership and attaches it to the response locals.
 */
module.exports.readOwnedItemById = selectOne(itemOwnershipModel.selectById, "item_ownership");

/**
 * Reads the specified item ownership and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readOwnedItem = (req, res, next) => res.status(200).json(res.locals.item_ownership);

/**
 * Middleware that checks if the specified character owns the specified item ownership.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 * @returns 
 */
module.exports.checkOwner = (req, res, next) => {
    if (res.locals.item_ownership.character_id != res.locals.character.character_id) {
        return res.status(403).json({ message: "You do not own this item." });
    }
    next();
}

/**
 * Middleware that makes a specified character equip an owned item.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.equipItem = (req, res, next) => {
    const ownership = res.locals.item_ownership;
    res.locals.equipped = ownership.slot;

    if (ownership.equipped == res.locals.equipped)
        return res.status(403).json({ message: `Already equipped ${ownership.name}.` });

    if (ownership.req > getLevel(res.locals.character.exp))
        return res.status(403).json({ message: "Character's level is too low to equip this item." });

    const updateEquip = () => {
        ownership.equipped = res.locals.equipped;
        itemOwnershipModel.updateById(ownership, next);
    }

    itemOwnershipModel.selectByEquipped(res.locals, (error, results) => {
        if (error)
            return next(error);
        const previouslyEquipped = results[0];

        if (previouslyEquipped) {
            previouslyEquipped.equipped = null;

            itemOwnershipModel.updateById(previouslyEquipped, (error) => {
                if (error)
                    return next(error);
                updateEquip();
            });
        }
        else {
            updateEquip();
        }
    });
}

/**
 * Middleware that makes a specified character unequip an owned item.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.unequipItem = (req, res, next) => {
    const ownership = res.locals.item_ownership;
    if (!ownership.equipped)
        return res.status(403).json({ message: "Item is not equipped." });

    ownership.equipped = null;
    itemOwnershipModel.updateById(ownership, next);
}

/**
 * Middleware that makes a specified character use an owned item.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.useItem = (req, res, next) => {
    const ownership = res.locals.item_ownership;

    if (ownership.req > getLevel(res.locals.character.exp))
        return res.status(403).json({ message: "Character's level is too low to use this item." });

    const slot = ownership.slot.toLowerCase();
    if (slot === "potion") {
        const character = res.locals.character;
        character.health += ownership.power;
        if (character.health > character.max_health)
            character.health = character.max_health;

        characterModel.updateById(character, (error) => {
            if (error)
                return next(error);

            itemOwnershipModel.deleteById(ownership, next);
        });
    }
    else {
        return res.status(403).json({ message: "Item cannot be used." });
    }
}

/**
 * Reads skill ownerships related to the specified user and sends a 200 response if successful.
 * The response body will be formatted as a number array.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readOwnedItems = (req, res, next) => {
    itemOwnershipModel.selectByCharacterId(res.locals, (error, results) => {
        if (error)
            return next(error);

        for (const result of results)
            delete result.character_id;

        res.status(200).json(results);
    });
}

/**
 * Reads the equipment of the specified user and sends a 200 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readEquipment = (req, res, next) => {
    itemOwnershipModel.selectEquipmentByCharacterId(res.locals, (error, results) => {
        if (error)
            return next(error);
        const equipment = {};
        for (const result of results) {
            equipment[result.equipped] = result;
            delete result.character_id;
            delete result.equipped;
            delete result.slot;
        }
        res.status(200).json(equipment);
    });
}

/**
 * Reads the equipped item ownership in the specified slot of the specified character and sends a 200 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readOwnedItemBySlot = (req, res, next) => {
    res.locals.equipped = req.params.slot;
    selectOne(itemOwnershipModel.selectByEquipped, "item_ownership")(req, res, next);
}

/**
 * Deletes the specified item ownership and sends a 204 response.
 */
module.exports.deleteOwnedItem = ensureDeleteById(itemOwnershipModel, "Item ownership not found.");