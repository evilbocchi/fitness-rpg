const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all users in the User table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM User;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified user in the User table and invokes the callback with the results.
 * 
 * @param {{user_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM User
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new user in the User table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{username: string, email: string, password: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO User (username, email, password)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.username, data.email, data.password];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the specified user with its username in the User table and invokes the callback with the results.
 * 
 * @param {{username: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByUsername = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM User
    WHERE username = ?;
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the specified user with its username or email in the User table and invokes the callback with the results.
 * 
 * @param {{username?: string, email?: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByUsernameOrEmail = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM User
    WHERE username = ? OR email = ?;
    `;
    const VALUES = [data.username, data.email];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified user in the User table and invokes the callback with the results.
 * 
 * @param {{user_id: number, username: string, email: string, password: string, skillpoints: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE User
    SET username = ?, email = ?, password = ?, skillpoints = ?
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.email, data.password, data.skillpoints, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified user in the User table and invokes the callback with the results.
 * 
 * @param {{user_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM User 
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}