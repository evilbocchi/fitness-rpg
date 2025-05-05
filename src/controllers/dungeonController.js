const { selectOne } = require("../middlewares/selection");
const { updateAndSelectById, ensureDeleteById } = require("../middlewares/byId");
const model = require("../models/dungeonModel");
const characterModel = require("../models/characterModel");
const userModel = require("../models/userModel");
const itemModel = require("../models/itemModel");
const monsterModel = require("../models/monsterModel");
const battleModel = require("../models/battleModel");
const itemOwnershipModel = require("../models/itemOwnershipModel");
const { getMaxExp, getLevel } = require("../configs/levelFormula");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Reads all dungeons and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readAllDungeon = (req, res, next) => {
    model.selectAll((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware that retrieves the specified dungeon and attaches it to the response locals.
 */
module.exports.readDungeonById = selectOne(model.selectById, "dungeon");

/**
 * Reads the specified dungeon and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readDungeon = (req, res, next) => res.status(200).json(res.locals.dungeon);

/**
 * Creates a new dungeon and sends a 201 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createDungeon = (req, res, next) => {
    model.insertSingle(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(201).json(results[1][0]);
    });
}

/**
 * Updates the specified dungeon and sends a 200 response.
 */
module.exports.updateDungeonById = updateAndSelectById(model, "Dungeon not found.");


/**
 * Middleware that calculates the loot table of the specified dungeon.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.calculateLootTable = (req, res, next) => {
    const dungeon = res.locals.dungeon;
    const level = dungeon.req;

    const getItemWeight = (item) => {
        if (item.special == true)
            return 0;

        let weight = 1;
        switch (item.rarity) {
            case "Common":
                weight = 100;
                break;
            case "Rare":
                weight = 30;
                break;
            case "Epic":
                weight = 10;
                break;
            case "Legendary":
                weight = 1;
                break;
        }

        const diff = Math.abs(level - item.req);
        return weight * (1 / (diff + 1)); // increment diff by 1 to avoid division by 0
    }

    itemModel.selectByLevelRange({
        min_level: level - 3,
        max_level: level + 3
    }, (error, items) => {
        if (error)
            return next(error);

        const lootTable = new Map();
        for (const item of items) {
            const weight = getItemWeight(item);
            if (weight == 0)
                continue;
            lootTable.set(item, weight);
        }

        res.locals.lootTable = lootTable;
        next();
    });
}

/**
 * Middleware that checks if the character is eligible to enter the specified dungeon.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.checkDungeonEntry = (req, res, next) => {
    const dungeon = res.locals.dungeon;
    const character = res.locals.character;

    if (character.level < dungeon.req)
        return res.status(403).json({
            message: "Character level is too low.",
            required: dungeon.req,
            current: character.level
        });

    if (character.health <= 0)
        return res.status(403).json({ message: "Character is dead." });

    res.locals.user_id = character.user_id;
    selectOne(userModel.selectById, "user")(req, res, (error) => {
        if (error)
            return next(error);

        const user = res.locals.user;
        const fee = dungeon.fee;
        if (user.skillpoints < fee)
            return res.status(403).json({
                message: "User does not have enough skillpoints.",
                required: fee,
                current: user.skillpoints
            });

        user.skillpoints -= fee;
        res.locals.fee = fee;

        userModel.updateById(user, (error) => {
            if (error)
                return next(error);
            next();
        });
    });
}

/**
 * Adds experience points to the character for completing a dungeon.
 * Sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.runDungeon = (req, res, next) => {
    const loot = res.locals.loot;
    const character = res.locals.character;
    const dungeon = res.locals.dungeon;
    const dungeonReq = dungeon.req;

    const baseExpGain = getMaxExp(dungeonReq) / 15 + 15;
    const oldLevel = character.level;
    const expGain = Math.floor(baseExpGain * (0.5 + Math.random()));
    character.exp += expGain;
    character.level = getLevel(character.exp);
    const addLootToInventory = (callback) => {
        if (loot.length > 0) {
            const data = { ownerships: [] };
            for (const item of loot) {
                data.ownerships.push({
                    character_id: res.locals.character.character_id,
                    item_id: item.item_id
                });
            }
    
            itemOwnershipModel.insertBulk(data, (error) => {
                if (error)
                    return next(error);
    
                callback();
            });
        }
        else {
            callback();
        }
    }

    const update = (monster) => {
        let battle_id = undefined;

        const sendResponse = () => {
            const resBody = {
                message: "Dungeon cleared!",
                loot: loot,
                exp: expGain,
                new_exp: character.exp
            };
            if (oldLevel != character.level) {
                resBody.new_level = character.level;
            }

            if (battle_id != undefined) {
                resBody.battle_id = battle_id;
                resBody.monster_id = monster.monster_id;
                resBody.message = "A monster was encountered while clearing the dungeon!";
            }

            res.status(200).json(resBody);
        }

        const updateCharacter = () => {
            characterModel.updateById(character, (error) => {
                if (error)
                    return next(error);
    
                sendResponse();
            });
        }

        if (monster != undefined) {
            battleModel.insertSingle({
                attacker_id: character.character_id,
                monster_id: monster.monster_id,
                monster_health: monster.health
            }, (error, results) => {
                if (error)
                    return next(error);
                battle_id = results.insertId;
                updateCharacter();
            });
        }
        else {
            updateCharacter();
        }
    }

    addLootToInventory(() => {
        if (Math.random() > 0.5) { // fixed chance of encountering a monster
            monsterModel.selectByLevelRange({
                min_level: dungeonReq - 3,
                max_level: dungeonReq + 3
            }, (error, results) => {
                if (error)
                    return next(error);

                update(results[Math.floor(Math.random() * results.length)]);
            });
        }
        else {
            update();
        }
    });
}