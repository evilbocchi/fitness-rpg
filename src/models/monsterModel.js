const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all monsters in the Monster table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Monster;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified monster in the Monster table and invokes the callback with the results.
 * 
 * @param {{monster_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Monster
    WHERE monster_id = ?;
    `;
    const VALUES = [data.monster_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves all monsters within the specified range in the Monster table and invokes the callback with the results.
 * 
 * @param {{min_level: number, max_level: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByLevelRange = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Monster
    WHERE level >= ? AND level <= ?;
    `;
    const VALUES = [data.min_level, data.max_level];

    pool.query(SQLSTATEMENT, VALUES, callback);
}