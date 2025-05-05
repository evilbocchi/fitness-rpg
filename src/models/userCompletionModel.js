const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves the specified completion record in the UserCompletion table and invokes the callback with the results.
 * 
 * @param {{complete_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM UserCompletion
    WHERE complete_id = ?;
    `;
    const VALUES = [data.complete_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves completion records by challenge in the UserCompletion table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByChallengeId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT UserCompletion.*, User.username
    FROM UserCompletion
    INNER JOIN User ON UserCompletion.user_id = User.user_id
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes completion records by challenge in the UserCompletion table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteByChallengeId = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM UserCompletion
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new completion record in the UserCompletion table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{challenge_id: number, user_id: number, completed: boolean, creation_date: string, notes?: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO UserCompletion (challenge_id, user_id, completed, creation_date, notes)
    VALUES (?, ?, ?, ?, ?);
    SELECT UserCompletion.*, User.username
    FROM UserCompletion
    INNER JOIN User ON UserCompletion.user_id = User.user_id
    WHERE complete_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.challenge_id, data.user_id, data.completed, data.creation_date, data.notes];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves completion records by user and challenge in the UserCompletion table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number, user_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByIds = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM UserCompletion
    WHERE challenge_id = ? AND user_id = ?;
    `;
    const VALUES = [data.challenge_id, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves completion records by user in the UserCompletion table and invokes the callback with the results.
 * ALso retrieves the challenge details.
 * 
 * @param {{user_id: number}} data Data object 
 * @param {QueryCallback} callback Asynchronous callback 
 */
module.exports.selectByUserId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT UserCompletion.*, FitnessChallenge.challenge
    FROM UserCompletion
    INNER JOIN FitnessChallenge ON UserCompletion.challenge_id = FitnessChallenge.challenge_id
    WHERE UserCompletion.user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}