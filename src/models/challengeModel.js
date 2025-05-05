const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Inserts a new challenge in the FitnessChallenge table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{challenge: string, user_id: number, skillpoints: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO FitnessChallenge (challenge, creator_id, skillpoints)
    VALUES (?, ?, ?);
    SELECT FitnessChallenge.*, User.username
    FROM FitnessChallenge
    INNER JOIN User ON FitnessChallenge.creator_id = User.user_id
    WHERE challenge_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.challenge, data.user_id, data.skillpoints];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves all challenges in the FitnessChallenge table and invokes the callback with the results.
 * Also retrieves the rating and total reviews for each challenge.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT FitnessChallenge.*, User.username, AVG(FitnessChallengeReview.rating) as rating, COUNT(FitnessChallengeReview.review_id) as reviews
    FROM FitnessChallenge
    INNER JOIN User ON FitnessChallenge.creator_id = User.user_id
    LEFT JOIN FitnessChallengeReview ON FitnessChallenge.challenge_id = FitnessChallengeReview.challenge_id
    GROUP BY FitnessChallenge.challenge_id;
    `;
    // use left join to include challenges with no reviews
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified challenge in the FitnessChallenge table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM FitnessChallenge
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified challenge in the FitnessChallenge table and invokes the callback with the results.
 * 
 * @param {{challenge: string, user_id: number, skillpoints: number, challenge_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `UPDATE FitnessChallenge
    SET challenge = ?, skillpoints = ?, creator_id = ?
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge, data.skillpoints, data.user_id, data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified challenge in the FitnessChallenge table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM FitnessChallenge 
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}


/**
 * Selects the 25 most popular challenges in the FitnessChallenge table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectPopular = (callback) => {
    const SQLSTATEMENT = `
    SELECT FitnessChallenge.*, User.username, AVG(FitnessChallengeReview.rating) as rating, 
    COUNT(DISTINCT FitnessChallengeReview.review_id) as reviews, COUNT(DISTINCT UserCompletion.complete_id) as attempts
    
    FROM FitnessChallenge
    INNER JOIN User ON FitnessChallenge.creator_id = User.user_id
    LEFT JOIN FitnessChallengeReview ON FitnessChallenge.challenge_id = FitnessChallengeReview.challenge_id
    LEFT JOIN UserCompletion ON FitnessChallenge.challenge_id = UserCompletion.challenge_id
    GROUP BY FitnessChallenge.challenge_id
    ORDER BY attempts DESC
    LIMIT 25;
    `;

    pool.query(SQLSTATEMENT, callback);
}

/**
 * Selects the 25 most recent challenges in the FitnessChallenge table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectRecent = (callback) => {
    const SQLSTATEMENT = `
    SELECT FitnessChallenge.*, User.username, AVG(FitnessChallengeReview.rating) as rating, 
    COUNT(DISTINCT FitnessChallengeReview.review_id) as reviews, COUNT(DISTINCT UserCompletion.complete_id) as attempts

    FROM FitnessChallenge
    INNER JOIN User ON FitnessChallenge.creator_id = User.user_id
    LEFT JOIN FitnessChallengeReview ON FitnessChallenge.challenge_id = FitnessChallengeReview.challenge_id
    LEFT JOIN UserCompletion ON FitnessChallenge.challenge_id = UserCompletion.challenge_id
    GROUP BY FitnessChallenge.challenge_id
    ORDER BY FitnessChallenge.creation_date DESC
    LIMIT 25;
    `;

    pool.query(SQLSTATEMENT, callback);
}

/**
 * Selects the 25 top rated challenges in the FitnessChallenge table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectTopRated = (callback) => {
    const SQLSTATEMENT = `
    SELECT FitnessChallenge.*, User.username, AVG(FitnessChallengeReview.rating) as rating, 
    COUNT(DISTINCT FitnessChallengeReview.review_id) as reviews, COUNT(DISTINCT UserCompletion.complete_id) as attempts

    FROM FitnessChallenge
    INNER JOIN User ON FitnessChallenge.creator_id = User.user_id
    LEFT JOIN FitnessChallengeReview ON FitnessChallenge.challenge_id = FitnessChallengeReview.challenge_id
    LEFT JOIN UserCompletion ON FitnessChallenge.challenge_id = UserCompletion.challenge_id
    GROUP BY FitnessChallenge.challenge_id
    ORDER BY rating DESC
    LIMIT 25;
    `;

    pool.query(SQLSTATEMENT, callback);
}

/**
 * Inserts a new challenge review in the FitnessChallengeReview table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number, user_id: number, rating: number, description: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertReview = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO FitnessChallengeReview (challenge_id, user_id, rating, description)
    VALUES (?, ?, ?, ?);
    SELECT *, User.username
    FROM FitnessChallengeReview
    INNER JOIN User ON FitnessChallengeReview.user_id = User.user_id
    WHERE review_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.challenge_id, data.user_id, data.rating, data.description];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves reviews of the specified challenge in the FitnessChallengeReview table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectReviewByChallengeId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT FitnessChallengeReview.*, User.username
    FROM FitnessChallengeReview
    INNER JOIN User ON FitnessChallengeReview.user_id = User.user_id
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves a review by the specified challenge and user in the FitnessChallengeReview table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number, user_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectReviewByIds = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM FitnessChallengeReview
    WHERE challenge_id = ? AND user_id = ?;
    `;
    const VALUES = [data.challenge_id, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified review in the FitnessChallengeReview table and invokes the callback with the results.
 * Also retrieves the updated row.
 * 
 * @param {{rating: number, description: string, challenge_id: number, user_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateReviewByIds = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE FitnessChallengeReview
    SET rating = ?, description = ?
    WHERE challenge_id = ? AND user_id = ?;
    `;
    const VALUES = [data.rating, data.description, data.challenge_id, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified review in the FitnessChallengeReview table and invokes the callback with the results.
 * 
 * @param {{challenge_id: number, user_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteReviewByIds = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM FitnessChallengeReview
    WHERE challenge_id = ? AND user_id = ?;
    `;
    const VALUES = [data.challenge_id, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}