const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all item ownerships in the ItemOwnership table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM ItemOwnership;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified item ownership in the ItemOwnership table and invokes the callback with the results.
 * 
 * @param {{ownership_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM ItemOwnership o
    JOIN Item i ON o.item_id = i.item_id
    WHERE ownership_id = ?;
    `;
    const VALUES = [data.ownership_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the item ownerships owned by the character in the ItemOwnership table and invokes the callback with the results.
 * 
 * @param {{character_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByCharacterId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM ItemOwnership o
    JOIN Item i ON o.item_id = i.item_id
    WHERE character_id = ?;
    `;
    const VALUES = [data.character_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves equipped item ownerships by the character in the ItemOwnership table and invokes the callback with the results.
 * 
 * @param {{character_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectEquipmentByCharacterId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM ItemOwnership o
    JOIN Item i ON o.item_id = i.item_id
    WHERE character_id = ? AND equipped IS NOT NULL;
    `;
    const VALUES = [data.character_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the item ownership being equipped by the character in the ItemOwnership table and invokes the callback with the results.
 * 
 * @param {{character_id: number, equipped: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByEquipped = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM ItemOwnership o
    JOIN Item i ON o.item_id = i.item_id
    WHERE character_id = ? AND equipped = ?;
    `;
    const VALUES = [data.character_id, data.equipped];

    pool.query(SQLSTATEMENT, VALUES, callback);
}


/**
 * Inserts a new item ownership in the ItemOwnership table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{character_id: number, item_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO ItemOwnership (character_id, item_id)
    VALUES (?, ?);
    SELECT * FROM ItemOwnership o
    JOIN Item i ON o.item_id = i.item_id
    WHERE ownership_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.character_id, data.item_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts new item ownerships in the ItemOwnership table and invokes the callback with the results.
 * 
 * @param {{ownerships: {character_id: number, item_id: number}[]}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertBulk = (data, callback) => {
    let SQLSTATEMENT = `INSERT INTO ItemOwnership (character_id, item_id) VALUES `;
    const VALUES = [];

    let i = 0;
    for (const ownership of data.ownerships) {
        if (i > 0)
            SQLSTATEMENT += ",";
        SQLSTATEMENT += `\n(?, ?)`;
        VALUES.push(ownership.character_id, ownership.item_id);
        ++i;
    }

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified item ownership in the ItemOwnership table and invokes the callback with the results.
 * 
 * @param {{character_id: number, item_id: number, equipped?: string, ownership_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE ItemOwnership 
    SET character_id = ?, item_id = ?, equipped = ?
    WHERE ownership_id = ?;
    `;
    const VALUES = [data.character_id, data.item_id, data.equipped, data.ownership_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}


/**
 * Deletes the specified item ownership in the ItemOwnership table and invokes the callback with the results.
 * 
 * @param {{ownership_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM ItemOwnership
    WHERE ownership_id = ?;
    `;
    const VALUES = [data.ownership_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}