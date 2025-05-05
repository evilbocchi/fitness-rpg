const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves the specified battle effect in the BattleEffect table and invokes the callback with the results.
 * 
 * @param {{battleeffect_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT battleeffect_id, battle_id, effect_type, effect_value, target, turns
    FROM BattleEffect be
    JOIN Effect e ON be.effect_id = e.effect_id
    WHERE battleeffect_id = ?;
    `;
    const VALUES = [data.battleeffect_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the specified battle effect by its battle in the BattleEffect table and invokes the callback with the results.
 * 
 * @param {{battle_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByBattleId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT battleeffect_id, battle_id, effect_type, effect_value, target, turns
    FROM BattleEffect be
    JOIN Effect e ON be.effect_id = e.effect_id
    WHERE battle_id = ?;
    `;
    const VALUES = [data.battle_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new battle effect in the BattleEffect table and invokes the callback with the results.
 * 
 * @param {{battle_id: number, effect_id: number, target: number, turns: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO BattleEffect (battle_id, effect_id, target, turns)
    VALUES (?, ?, ?, ?);
    `;
    const VALUES = [data.battle_id, data.effect_id, data.target, data.turns];

    pool.query(SQLSTATEMENT, VALUES, callback);
}


/**
 * Inserts new battle effects in the BattleEffect table and invokes the callback with the results.
 * 
 * @param {{battle_id: number, effects: {effect_id: number, target: number, turns: number}[]}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertBulk = (data, callback) => {
    let SQLSTATEMENT = `INSERT INTO BattleEffect (battle_id, effect_id, target, turns) VALUES `;
    const VALUES = [];

    let i = 1;
    const effects = data.effects;
    for (const effect of effects) {
        if (i > 1 && i <= effects.length)
            SQLSTATEMENT += ",";
        SQLSTATEMENT += `\n(?, ?, ?, ?)`;

        VALUES.push(data.battle_id, effect.effect_id, effect.target, effect.turns);
        ++i;
    }

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified battle effect in the BattleEffect table and invokes the callback with the results.
 * 
 * @param {{battleeffect_id: number, battle_id: number, effect_id: number, target: number, turns: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE BattleEffect 
    SET battle_id = ?, effect_id = ?, target = ?, turns = ?
    WHERE battleeffect_id = ?;
    `;
    const VALUES = [data.battle_id, data.effect_id, data.target, data.turns, data.battleeffect_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates battle effects belonging to a battle in the BattleEffect table such that their turns are decremented by 1 and invokes the callback with the results.
 * 
 * @param {{battle_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.countdownByBattleId = (data, callback) => {
    let SQLSTATEMENT = `UPDATE BattleEffect
    SET turns = turns - 1
    WHERE battle_id = ?;
    `;
    const VALUES = [data.battle_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}


/**
 * Deletes the specified battle effect in the BattleEffect table and invokes the callback with the results.
 * 
 * @param {{battleeffect_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM BattleEffect 
    WHERE battleeffect_id = ?;
    `;
    const VALUES = [data.battleeffect_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified battle effects in the BattleEffect table and invokes the callback with the results.
 * 
 * @param {{battleeffect_ids: number[]}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteByIds = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM BattleEffect 
    WHERE battleeffect_id IN (?);
    `;
    const VALUES = [data.battleeffect_ids];

    pool.query(SQLSTATEMENT, VALUES, callback);
}