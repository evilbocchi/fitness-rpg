const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all characters in the UserCharacter table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM UserCharacter;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified character in the UserCharacter table and invokes the callback with the results.
 * 
 * @param {{character_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM UserCharacter
    WHERE character_id = ?;
    `;
    const VALUES = [data.character_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the characters owned by the specified user in the UserCharacter table and invokes the callback with the results.
 * 
 * @param {{user_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByUser = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM UserCharacter
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new character in the UserCharacter table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{user_id: number, name: string, element: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO UserCharacter (user_id, name, element)
    VALUES (?, ?, ?);
    SELECT * FROM UserCharacter WHERE character_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.user_id, data.name, data.element];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified character in the UserCharacter table and invokes the callback with the results.
 * 
 * @param {{character_id: number, name: string, element: string, mana: number, health: number, exp: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE UserCharacter
    SET name = ?, element = ?, mana = ?, health = ?, exp = ?
    WHERE character_id = ?;
    `;
    const VALUES = [data.name, data.element, data.mana, data.health, data.exp, data.character_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified character in the UserCharacter table and invokes the callback with the results.
 * 
 * @param {{character_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM UserCharacter 
    WHERE character_id = ?;
    `;
    const VALUES = [data.character_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}