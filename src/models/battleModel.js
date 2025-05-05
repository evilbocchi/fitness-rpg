const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all battles in the Battle table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Battle;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified battle in the Battle table and invokes the callback with the results.
 * 
 * @param {{battle_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT Battle.*, Monster.name AS monster_name, Monster.health AS monster_max_health
    FROM Battle
    LEFT JOIN Monster ON Battle.monster_id = Monster.monster_id
    WHERE battle_id = ?;
    `;
    const VALUES = [data.battle_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves any battle the specified character is fighting in the Battle table and invokes the callback with the results.
 *  * 
 * @param {{character_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectOngoingByCharacterId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT Battle.*, Monster.name AS monster_name, Monster.health AS monster_max_health
    FROM Battle
    LEFT JOIN Monster ON Battle.monster_id = Monster.monster_id
    WHERE finished IS FALSE AND (attacker_id = ? OR defender_id = ?);
    `;
    const VALUES = [data.character_id, data.character_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves any battle the two specified characters are fighting in the Battle table and invokes the callback with the results.
 * Used to prevent characters fighting multiple battles at the same time.
 * 
 * @param {{character1_id: number, character2_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectOngoingByTwoCharacterIds = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Battle
    WHERE finished IS FALSE AND (attacker_id = ? OR attacker_id = ? OR defender_id = ? OR defender_id = ?);
    `;
    const VALUES = [data.character1_id, data.character2_id, data.character1_id, data.character2_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new battle in the Battle table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{attacker_id: number, defender_id?: number, monster_id?: number, monster_health?: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Battle (attacker_id, defender_id, monster_id, monster_health)
    VALUES (?, ?, ?, ?);
    `;
    const VALUES = [data.attacker_id, data.defender_id, data.monster_id, data.monster_health];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified battle in the Battle table and invokes the callback with the results.
 * 
 * @param {{battle_id: number, turns: number, winner: number, finished?: boolean, monster_health?: number, last_result?: string, last_effect_result?: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE Battle 
    SET turns = ?, winner = ?, finished = ?, monster_health = ?, last_result = ?, last_effect_result = ?
    WHERE battle_id = ?;
    `;
    const VALUES = [data.turns, data.winner, data.finished, data.monster_health, data.last_result, data.last_effect_result, data.battle_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new battle request in the BattleRequest table and invokes the callback with the results.
 * 
 * @param {{requester_id: number, user_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertRequest = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO BattleRequest (requester_id, user_id)
    VALUES (?, ?);
    `;
    const VALUES = [data.requester_id, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the specified battle request in the BattleRequest table and invokes the callback with the results.
 * 
 * @param {{requester_id: number}} data Data object 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectRequestById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM BattleRequest
    WHERE request_id = ?;
    `;
    const VALUES = [data.request_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves battle requests made by the specified character in the BattleRequest table and invokes the callback with the results.
 * 
 * @param {{requester_id: number}} data Data object 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectRequestByCharacterId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM BattleRequest
    WHERE requester_id = ?;
    `;
    const VALUES = [data.requester_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves battle requests sent to the specified user in the BattleRequest table and invokes the callback with the results.
 * 
 * @param {{user_id: number}} data Data object 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectRequestByUserId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT BattleRequest.*, UserCharacter.name AS character_name, UserCharacter.exp, User.username, User.user_id AS requester_user_id
    FROM BattleRequest
    INNER JOIN UserCharacter ON BattleRequest.requester_id = UserCharacter.character_id
    INNER JOIN User ON UserCharacter.user_id = User.user_id
    WHERE BattleRequest.user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the specified battle request in the BattleRequest table and invokes the callback with the results.
 * 
 * @param {{requester_id: number, user_id: number}} data Data object 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectRequestByIds = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM BattleRequest
    WHERE requester_id = ? AND user_id = ?;
    `;
    const VALUES = [data.requester_id, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified battle request in the BattleRequest table and invokes the callback with the results.
 * 
 * @param {{request_id: number}} data Data object 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteRequestById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM BattleRequest
    WHERE request_id = ?;
    `;
    const VALUES = [data.request_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}