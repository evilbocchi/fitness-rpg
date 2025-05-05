const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all dungeons in the Dungeon table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT *, (req * 20 + 20) AS fee
    FROM Dungeon;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified dungeon in the Dungeon table and invokes the callback with the results.
 * 
 * @param {{dungeon_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT *, (req * 20 + 20) AS fee
    FROM Dungeon
    WHERE dungeon_id = ?;
    `;
    const VALUES = [data.dungeon_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new dungeon in the Dungeon table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{name: string, req: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Dungeon (name, req)
    VALUES (?, ?);
    SELECT *, (req * 20 + 20) AS fee
    FROM Dungeon
    WHERE dungeon_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.name, data.req];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified dungeon in the Dungeon table and invokes the callback with the results.
 * 
 * @param {{dungeon_id: number, name: string, req: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE Dungeon 
    SET name = ?, req = ?
    WHERE dungeon_id = ?;
    `;
    const VALUES = [data.name, data.req, data.dungeon_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified dungeon in the Dungeon table and invokes the callback with the results.
 * 
 * @param {{dungeon_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM Dungeon 
    WHERE dungeon_id = ?;
    `;
    const VALUES = [data.dungeon_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}