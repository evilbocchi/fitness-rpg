const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all skill effects in the Effect table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Effect;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified skill effect in the Effect table and invokes the callback with the results.
 * 
 * @param {{effect_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Effect
    WHERE effect_id = ?;
    `;
    const VALUES = [data.effect_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the specified skill effect by its skill in the Effect table and invokes the callback with the results.
 * 
 * @param {{skill_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectBySkillId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Effect
    WHERE skill_id = ?;
    `;
    const VALUES = [data.skill_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new skill effect in the Effect table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{skill_id: number, effect_type: string, effect_target: string, effect_value: number, duration: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Effect (skill_id, effect_type, effect_target, effect_value, duration)
    VALUES (?, ?, ?, ?, ?);
    SELECT * FROM Effect WHERE effect_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.skill_id, data.effect_type, data.effect_target, data.effect_value, data.duration];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified skill effect in the Effect table and invokes the callback with the results.
 * 
 * @param {{effect_id: number, skill_id: number, effect_type: string, effect_target: string, effect_value: number, duration: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE Effect 
    SET skill_id = ?, effect_type = ?, effect_target = ?, effect_value = ?, duration = ?
    WHERE effect_id = ?;
    `;
    const VALUES = [data.skill_id, data.effect_type, data.effect_target, data.effect_value, data.duration, data.effect_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified skill effect in the Effect table and invokes the callback with the results.
 * 
 * @param {{effect_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM Effect 
    WHERE effect_id = ?;
    `;
    const VALUES = [data.effect_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}