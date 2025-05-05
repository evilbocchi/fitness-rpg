const model = require("../models/battleModel.js");
const battleEffectModel = require('../models/battleEffectModel.js');
const skillModel = require("../models/skillModel.js");
const effectModel = require("../models/effectModel.js");
const characterModel = require("../models/characterModel");
const monsterModel = require("../models/monsterModel.js");
const skillOwnershipModel = require("../models/skillOwnershipModel.js");
const { select, selectOne } = require('../middlewares/selection');
const { calculateCharacterStats } = require("../middlewares/stats.js");
const { getRandomLoot } = require("../middlewares/lootTable.js");
const { getMaxExp } = require("../configs/levelFormula.js");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */


/**
 * Middleware that retrieves the specified battle and attaches it to the response locals.
 */
module.exports.readBattleById = selectOne(model.selectById, "battle");

/**
 * Middleware that retrieves the battle the specified character is in and attaches it to the response locals.
 */
module.exports.readBattleByCharacterId = selectOne(model.selectOngoingByCharacterId, "battle");

/**
 * Reads the specified battle and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readBattle = (req, res, next) => {
    const battle = res.locals.battle;
    battle.last = {
        result: battle.last_result,
        effectResult: battle.last_effect_result
    };
    delete battle.last_result;
    delete battle.last_effect_result;

    if (res.locals.attacker) {
        battle.attacker = res.locals.attacker;
    }
    if (res.locals.defender) {
        battle.defender = res.locals.defender;
    }

    res.status(200).json(battle);
}

/**
 * Starts a battle between two characters and sends a 201 response.
 * The `turn` value in the response body signifies which character can send an attack.
 * If turn is 0, 2, 4, etc. (even), the attacker gets to attack.
 * Else, the defender gets to attack.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.startPvP = (req, res, next) => {
    if (res.locals.attacker.health <= 0 || res.locals.defender.health <= 0)
        return res.status(400).json({ message: "Cannot initiate battle with no health." });
    if (res.locals.attacker.user_id == res.locals.defender.user_id)
        return res.status(400).json({ message: "Cannot initiate battle with the same user." });

    res.locals.attacker_id = res.locals.attacker.character_id;
    res.locals.defender_id = res.locals.defender.character_id;
    if (res.locals.attacker_id == res.locals.defender_id)
        return res.status(400).json({ message: "Attacker cannot be the same as defender." });

    // check if a request exists

    const insert = () => {
        model.insertSingle(res.locals, (error, results) => {
            if (error)
                return next(error);
            res.status(201).json({ battle_id: results.insertId });
        });
    }

    model.selectRequestByIds({
        requester_id: res.locals.attacker_id,
        user_id: res.locals.defender.user_id
    }, (error, results) => {
        if (error)
            return next(error);

        const request = results[0];
        if (request == undefined)
            return res.status(403).json({ message: "No battle request found." });

        model.deleteRequestById(request, (error) => {
            if (error)
                return next(error);

            insert();
        });
    });
}

/**
 * Updates a battle and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.updateBattleById = (req, res, next) => {
    model.updateById(res.locals, (error) => {
        if (error)
            return next(error);

        model.selectById(res.locals, (error, results) => {
            if (error)
                next(error);

            res.status(200).json(results);
        });
    });
}

/**
 * Middleware that retrieves character information from `res.locals.battle`.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.extractCharacters = (req, res, next) => {
    const battle = res.locals.battle;

    const charactersRetrieved = () => {
        if (battle.turns % 2 === 0) {
            res.locals.active = res.locals.attacker;
            res.locals.passive = res.locals.defender;
        }
        else {
            res.locals.active = res.locals.defender;
            res.locals.passive = res.locals.attacker;
        }
        const user_id = res.locals.user_id;
        if (user_id != undefined && res.locals.active.user_id != user_id) {
            return res.status(403).json({ message: 'Not your turn.' });
        }

        next();
    }

    const selectCharacter = (character_id, key, callback) => {
        characterModel.selectById({ character_id: character_id }, (error, results) => {
            if (error)
                return next(error);
            const character = results[0];
            res.locals.character = character;
            calculateCharacterStats(req, res, (error) => {
                if (error)
                    return next(error);

                res.locals[key] = character;
                callback();
            });
        });
    }

    selectCharacter(battle.attacker_id, "attacker", () => {
        if (battle.monster_id == undefined) {
            selectCharacter(battle.defender_id, "defender", charactersRetrieved);
        }
        else {
            monsterModel.selectById(battle, (error, results) => {
                if (error)
                    return next(error);
                const monster = results[0];
                monster.max_health = monster.health;
                monster.health = battle.monster_health;
                res.locals.defender = monster;
                charactersRetrieved();
            });
        }
    });
}

/**
 * Middleware that checks if the current turn's character owns a specified skill.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.checkSkillOwnership = (req, res, next) => {
    if (res.locals.active.character_id == undefined) // is monster
        return next();

    skillOwnershipModel.selectByIds({
        character_id: res.locals.active.character_id,
        skill_id: res.locals.skill.skill_id
    }, (error, results) => {
        if (error)
            return next(error);
        if (results.length == 0)
            return res.status(403).json({ message: `${res.locals.active.name} is not allowed to use ${res.locals.skill.name}.` });
        next();
    });
}

/**
 * Runs the specified effect.
 * 
 * @param {any} effect Effect to run.
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.runEffect = (effect, req, res, next) => {
    const active = res.locals.active;
    const passive = res.locals.passive;
    const log = res.locals.currentLog;
    let target = undefined;

    switch (effect.target) {
        case "Attacker":
            target = res.locals.attacker;
            break;
        case "Defender":
            target = res.locals.defender;
            break;
        default:
            return new Error(`Cannot find target ${effect.target}`);
    }

    const targetName = target.name;
    const value = effect.effect_value;
    const absValue = Math.abs(value);
    switch (effect.effect_type) {
        case "Health":
            let delta = value;
            let newHealth = Math.min(target.health + delta, target.max_health);
            delta = newHealth - target.health;
            target.health = newHealth;
            log.effectResult += `\n${value > 0 ? "Healed" : "Hurt"} ${targetName} by ${Math.abs(delta)} health.`;
            break;
        case "Incoming Damage":
            if (target == passive) {
                res.locals.damageMultiplier *= (100 + value) / 100;
            }
            log.effectResult += `\n${value > 0 ? "Increased" : "Decreased"} ${targetName}'s damage taken by ${absValue}%.`;
            break;
        case "Outgoing Damage":
            if (target == active) {
                res.locals.damageMultiplier *= (100 + value) / 100;
            }
            log.effectResult += `\n${value > 0 ? "Increased" : "Decreased"} ${targetName}'s damage done by ${absValue}%.`;
            break;
        case "Accuracy":
            if (target == active) {
                res.locals.accuracyMultiplier += value / 100;
            }
            log.effectResult += `\n${value > 0 ? "Increased" : "Decreased"} ${targetName}'s accuracy by ${absValue}.`;
            break;
    }

    const remainingTurns = effect.turns--;
    if (remainingTurns != 0)
        log.effectResult += ` (${remainingTurns} ${remainingTurns == 1 ? "turn" : "turns"} left)`;
}

/**
 * Middleware that runs the turn passively, formatting the response locals and applying effects to characters.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.runTurn = (req, res, next) => {
    res.locals.damageMultiplier = 1;
    res.locals.accuracyMultiplier = 1;

    if (res.locals.battle.finished == true)
        return res.status(403).json({ message: 'Battle has already ended.' });

    const logs = res.locals.logs ?? [];
    const log = {
        attacker: {
            starting_health: res.locals.attacker.health,
            starting_mana: res.locals.attacker.mana,
        },
        defender: {
            starting_health: res.locals.defender.health,
            starting_mana: res.locals.defender.mana,
        },
        result: "",
        effectResult: "",
    }
    logs.push(log);
    res.locals.logs = logs;
    res.locals.currentLog = log; // turn to modify

    const deletedExpiring = (error) => {
        if (error)
            next(error);

        battleEffectModel.countdownByBattleId(res.locals, (error) => {
            if (error)
                next(error);

            next();
        });
    }

    const expiringEffectIds = [];
    select(battleEffectModel.selectByBattleId, "battle_effects")(req, res, (error) => {
        if (error)
            next(error);

        for (const effect of res.locals.battle_effects) {
            const error = this.runEffect(effect, req, res, next);
            if (error)
                return next(error);
            if (effect.turns <= 0)
                expiringEffectIds.push(effect.battleeffect_id);
        }

        if (expiringEffectIds.length > 0)
            battleEffectModel.deleteByIds({ battleeffect_ids: expiringEffectIds }, deletedExpiring);
        else
            deletedExpiring();
    });
}

/**
 * Middleware that makes the current turn's character use a skill.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.runActiveSkill = (req, res, next) => {
    const active = res.locals.active;
    const passive = res.locals.passive;
    const skill = res.locals.skill;
    const battle = res.locals.battle;
    const log = res.locals.currentLog;

    if (active.health <= 0)
        return next();

    const manaCost = skill.mana_cost;
    if (active.mana < manaCost)
        return res.status(403).json({
            message: `${manaCost} Mana is needed to use ${skill.name}!`,
            current: active.mana,
            cost: manaCost
        });

    active.mana -= manaCost;
    battle.turns += 1;

    log.result += `\n${active.name} used ${skill.name}.`;
    if (active.character_id != undefined) {
        log.result += ` [-${manaCost} Mana]`;
    }

    if (active.element == skill.element) // same element bonus
        res.locals.damageMultiplier *= 1.2;

    if (Math.random() * 100 < skill.accuracy * res.locals.accuracyMultiplier) { // hit
        const damage = Math.floor((skill.damage + active.power) * res.locals.damageMultiplier);
        passive.health -= damage;
        if (damage > 0)
            log.result += `\nDealt ${damage} damage to ${passive.name}!`;

        const savingEffects = [];
        for (let effect of res.locals.effects) {
            const target = effect.effect_target == "Self" ? active : passive;
            effect = {
                effect_id: effect.effect_id,
                effect_value: effect.effect_value,
                effect_type: effect.effect_type,
                target: target == res.locals.attacker ? "Attacker" : "Defender",
                turns: effect.duration
            }
            const error = this.runEffect(effect, req, res, next);
            if (error)
                next(error);

            if (effect.turns >= 0) {
                savingEffects.push(effect);
            }
        }
        if (savingEffects.length > 0)
            battleEffectModel.insertBulk({
                battle_id: res.locals.battle_id,
                effects: savingEffects,
            }, next);
        else
            next();
    }
    else { // miss
        log.result += "\nThe skill missed.";
        next();
    }
}

/**
 * Middleware that makes the current turn's character skip their turn and recover 20 Mana.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.guard = (req, res, next) => {
    let manaGain = 20;
    const active = res.locals.active;
    const oldMana = active.mana;
    const newMana = Math.min(oldMana + manaGain, active.max_mana);
    active.mana = newMana;

    res.locals.battle.turns += 1;
    res.locals.currentLog.result += `\n${active.name} holds position. [+${newMana - oldMana} Mana]`;
    next();
}

/**
 * Middleware that makes the monster attack the character.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.runMonster = (req, res, next) => {
    const battle = res.locals.battle;
    const monster = res.locals.defender;

    if (battle.monster_id == undefined)
        return next();

    const passive = res.locals.active;
    const active = res.locals.passive;
    res.locals.active = active;
    res.locals.passive = passive;
    res.locals.effects = []; // clear previous turn's applied effects

    const getRandomSkill = (callback) => {
        const cost = 50 + monster.level * 10;
        skillModel.selectAll((error, skills) => {
            if (error)
                return next(error);

            const lootTable = new Map();
            for (const skill of skills) {
                const diff = Math.abs(skill.skillpoint_purchase_cost - cost);
                let weight = 1 / (diff + 1);
                if (skill.element == monster.element) // increase chance for same element
                    weight *= 3;
                lootTable.set(skill, weight);
            }
            res.locals.lootTable = lootTable;
            getRandomLoot(1)(req, res, (error) => {
                if (error)
                    return next(error);

                const skill = res.locals.loot[0];
                callback(skill);
            });
        });
    }

    const runSkill = () => this.runActiveSkill(req, res, (error) => {
        if (error)
            return next(error);
        next();
    });

    this.runTurn(req, res, (error) => {
        if (error)
            return next(error);

        getRandomSkill((skill) => {
            res.locals.skill = skill;

            effectModel.selectBySkillId({ skill_id: skill.skill_id }, (error, results) => {
                if (error)
                    return next(error);
                res.locals.effects = results; // get the effects of the skill the monster is using
                runSkill();
            });
        });
    });
}

/**
 * Checks for battle completion, then applies changes on `res.locals.attacker`, `res.locals.defender` and `res.locals.battle`.
 * Sends a 200 response with `res.locals.result`.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.applyChanges = (req, res, next) => {
    const active = res.locals.active;
    const passive = res.locals.passive;
    const attacker = res.locals.attacker;
    const defender = res.locals.defender;
    const battle = res.locals.battle;

    if (defender.character_id == undefined) {
        battle.monster_health = Math.max(defender.health, 0);
    }

    let loser = undefined;
    let isDraw = false;
    if (active.health <= 0)
        loser = active;

    if (passive.health <= 0) {
        if (loser != undefined) {
            loser = undefined;
            isDraw = true;
        }
        else {
            loser = passive;
        }
    }

    const log = res.locals.currentLog;
    if (loser != undefined) {
        const winner = loser == active ? passive : active;
        loser.health = 0;
        if (loser.exp == undefined)
            loser.exp = getMaxExp(loser.level);


        log.result += `\n${winner.name} wins!`;

        if (winner.exp != undefined) {
            const earnings = Math.floor(20 + Math.sqrt(loser.exp));
            winner.exp += earnings;
            log.result += `\n[+${earnings} EXP]`;
        }

        battle.winner = winner.character_id;
        battle.finished = true;
    }
    else if (isDraw) {
        active.health = 0;
        passive.health = 0;

        log.result += `\nBoth characters have lost all their health. It's a draw!`;
        battle.finished = true;
    }

    const logs = res.locals.logs;
    for (const log of logs) {
        log.result = log.result.substring(1);
        if (log.effectResult != "")
            log.effectResult = log.effectResult.substring(1);
    }
    battle.last_result = log.result;
    battle.last_effect_result = log.effectResult;

    const sendUpdate = () => {
        delete battle.battle_id;
        delete battle.attacker_id;
        delete battle.defender_id;
        delete battle.start_time;
        delete battle.last_result;
        delete battle.last_effect_result;

        res.status(200).json({
            logs: logs,
            attacker: {
                health: attacker.health,
                mana: attacker.mana
            },
            defender: {
                health: defender.health,
                mana: defender.mana
            }
        });
    }

    characterModel.updateById(attacker, (error) => {
        if (error)
            return next(error);

        const updateModel = () => model.updateById(battle, (error) => {
            if (error)
                return next(error);
            sendUpdate();
        });

        if (defender.character_id != undefined)
            characterModel.updateById(defender, (error) => {
                if (error)
                    return next(error);

                updateModel();
            });
        else
            updateModel();
    });
}

/**
 * Middleware that checks for whether the specified character or attacker and defender in the response locals are not in any battle.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.notInBattle = (req, res, next) => {
    const resBody = { message: "Character is currently in battle." };

    if (res.locals.attacker != undefined && res.locals.defender != undefined) {
        model.selectOngoingByTwoCharacterIds({
            character1_id: res.locals.attacker.character_id,
            character2_id: res.locals.defender.character_id
        }, (error, results) => {
            if (error)
                return next(error);

            if (results.length > 0)
                return res.status(403).json(resBody);

            next();
        });
    }
    else {
        model.selectOngoingByCharacterId(res.locals, (error, results) => {
            if (error)
                return next(error);

            if (results.length > 0)
                return res.status(403).json(resBody);

            next();
        });
    }
}

/**
 * Forfeit the battle by killing the current turn's character.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.forfeit = (req, res, next) => {
    const active = res.locals.active;
    res.locals.currentLog.result += `\n${active.name} has forfeited the battle.`;
    active.health = -Infinity;
    next();
}

/**
 * Middleware that retrieves the specified request and attaches it to the response locals.
 */
module.exports.readRequestById = selectOne(model.selectRequestById, "request");

/**
 * Middleware that retrieves requests by the specified character.
 */
module.exports.readRequestsByCharacterId = select(model.selectRequestByCharacterId, "requests");

/**
 * Middleware that retrieves requests towards the specified user.
 */
module.exports.readRequestsByUserId = select(model.selectRequestByUserId, "requests");

/**
 * Reads the specified requests and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readRequests = (req, res, next) => res.status(200).json(res.locals.requests);


/**
 * Requests a battle with another user.
 * The character will be used as the requester and the requestee_id will be used as the user_id, which is the user to request a battle with.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.requestBattle = (req, res, next) => {
    const requester = res.locals.character;
    const requestee_id = res.locals.user.user_id;

    if (requester.user_id == requestee_id)
        return res.status(403).json({ message: "Cannot request battle with yourself." });

    const data = {
        requester_id: requester.character_id,
        user_id: requestee_id
    };

    const insert = () => {
        model.insertRequest(data, (error) => {
            if (error)
                return next(error);
    
            res.status(201).json({ message: "Battle request sent." });
        });
    }

    model.selectRequestByIds(data, (error, results) => {
        if (error)
            return next(error);

        if (results.length > 0)
            return res.status(403).json({ message: "Battle request already sent." });

        insert();
    });
}

/**
 * Cancel a battle request. Can only be done by the requester or the requestee.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.cancelRequest = (req, res, next) => {
    const request = res.locals.request;
    if (request.requester_id == res.locals.character_id || request.user_id == res.locals.user_id) {
        model.deleteRequestById(request, (error) => {
            if (error)
                return next(error);

            res.status(204).end();
        });
    }
    else {
        res.status(403).json({ message: "Cannot cancel another user's request." });
    }
}