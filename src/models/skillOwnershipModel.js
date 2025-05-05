const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all skill ownerships in the SkillOwnership table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM SkillOwnership;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified skill ownership in the SkillOwnership table and invokes the callback with the results.
 * 
 * @param {{character_id: number, skill_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByIds = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM SkillOwnership
    WHERE character_id = ? AND skill_id = ?;
    `;
    const VALUES = [data.character_id, data.skill_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the skill ownerships owned by the character in the SkillOwnership table and invokes the callback with the results.
 * 
 * @param {{character_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByCharacterId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM SkillOwnership
    WHERE character_id = ?;
    `;
    const VALUES = [data.character_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the skill ownerships owned by the character in the SkillOwnership table and invokes the callback with the results.
 * Also retrieves the full skill object from the Skill table.
 * 
 * @param {{character_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectDetailedByCharacterId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM SkillOwnership
    INNER JOIN Skill ON SkillOwnership.skill_id = Skill.skill_id
    WHERE character_id = ?;
    `;
    const VALUES = [data.character_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new skill ownership in the SkillOwnership table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{character_id: number, skill_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO SkillOwnership (character_id, skill_id)
    VALUES (?, ?);
    SELECT * FROM SkillOwnership WHERE ownership_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.character_id, data.skill_id, data.character_id, data.skill_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}