const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all items in the Item table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Item;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves all items within the specified range in the Item table and invokes the callback with the results.
 * 
 * @param {{min_level: number, max_level: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByLevelRange = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Item
    WHERE req >= ? AND req <= ?;
    `;
    const VALUES = [data.min_level, data.max_level];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the specified item in the Item table and invokes the callback with the results.
 * 
 * @param {{item_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Item
    WHERE item_id = ?;
    `;
    const VALUES = [data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new item in the Item table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{name: string, power: number, req: number, slot: string, effect_type: string, element: string, rarity: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Item (name, power, req, slot, effect_type, element, rarity)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    SELECT * FROM Item WHERE item_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.name, data.power, data.req, data.slot, data.effect_type, data.element, data.rarity];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified item in the Item table and invokes the callback with the results.
 * 
 * @param {{item_id: number, name: string, power: number, req: number, slot: string, effect_type: string, element: string, rarity: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE Item 
    SET name = ?, power = ?, req = ?, slot = ?, effect_type = ?, element = ?, rarity = ?
    WHERE item_id = ?;
    `;
    const VALUES = [data.name, data.power, data.req, data.slot, data.effect_type, data.element, data.rarity, data.item_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified item in the Item table and invokes the callback with the results.
 * 
 * @param {{item_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM Item 
    WHERE item_id = ?;
    `;
    const VALUES = [data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}