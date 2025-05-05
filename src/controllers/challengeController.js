const model = require("../models/challengeModel.js");
const userModel = require("../models/userModel.js");
const userCompletionModel = require("../models/userCompletionModel.js");
const { updateAndSelectById, ensureDeleteById } = require("../middlewares/byId.js");
const { selectOne, selectList } = require("../middlewares/selection.js");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Creates a new challenge and sends a 201 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createChallenge = (req, res, next) => {
    model.insertSingle(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(201).json(results[1][0]);
    });
}

/**
 * Reads all challenges and sends a 200 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readAllChallenge = (req, res, next) => {
    model.selectAll((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Reads all challenges by popularity and sends a 200 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readPopularChallenge = (req, res, next) => {
    model.selectPopular((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Reads all challenges by recency and sends a 200 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readRecentChallenge = (req, res, next) => {
    model.selectRecent((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Reads all challenges by rating and sends a 200 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readTopRatedChallenge = (req, res, next) => {
    model.selectTopRated((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware that retrieves the specified challenge and attaches it to the response locals.
 */
module.exports.readChallengeById = selectOne(model.selectById, "challengeObj", "Challenge not found.");

/**
 * Reads the specified challenge and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readChallenge = (req, res, next) => res.status(200).json(res.locals.challenge);

/**
 * Updates a challenge and sends a 200 response.
 */
module.exports.updateChallengeById = updateAndSelectById(model, "Challenge not found.");

/**
 * Deletes a challenge from the FitnessChallenge. Sends a 200 response.
 */
module.exports.deleteChallengeById = ensureDeleteById(model, "Challenge not found.");

/**
 * Middleware that deletes all challenge records associated with the specified challenge.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.deleteChallengeRecordsByChallengeId = (req, res, next) => {
    userCompletionModel.deleteByChallengeId(res.locals, (error) => {
        if (error)
            return next(error);

        next();
    });
}

/**
 * Creates a new completion record, providing the specified user with skillpoints.
 * If completed is `true`, the user is rewarded with the total challenge skillpoint amount, else only rewards 5 skillpoints.
 * Sends a 201 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createCompletionRecord = (req, res, next) => {
    res.locals.notes = req.body.notes;
    res.locals.completed = req.body.completed ?? false;


    // add by challenge points if completed, else 5
    res.locals.user.skillpoints += res.locals.completed ? res.locals.challengeObj.skillpoints : 5;

    userModel.updateById(res.locals.user, (error) => {
        if (error)
            return next(error);

        userCompletionModel.insertSingle(res.locals, (error, results) => {
            if (error)
                return next(error);

            res.status(201).json(results[1][0]);
        });
    });
}

/**
 * Reads completion records of the specified challenge and sends a 200 response.
 * If no records are found, sends a 404 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readCompletionRecordsByChallengeId = selectList(userCompletionModel.selectByChallengeId, null, "No completion records found.");

/**
 * Reads the completion records of the specified user and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readCompletionRecordsByUserId = (req, res, next) => {
    userCompletionModel.selectByUserId(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}


/**
 * Middleware that verifies that the user is the owner of the specified challenge.
 * Checks if the `user_id` in the request body matches the `creator_id` of the challenge.
 * Sends a 403 response if the user is not the owner.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.checkChallengeOwnership = (req, res, next) => {
    if (res.locals.challengeObj.creator_id !== res.locals.user_id)
        return res.status(403).json({ message: "user_id must be the same as the challenge's creator_id" });
    next();
}

/**
 * Middleware that checks if the user is eligible to review the challenge.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.checkEligibleToReview = (req, res, next) => {
    userCompletionModel.selectByIds(res.locals, (error, results) => {
        if (error)
            return next(error);

        if (results.length === 0)
            return res.status(403).json({ message: "You must complete the challenge before reviewing." });

        model.selectReviewByIds(res.locals, (error, results) => {
            if (error)
                return next(error);

            if (results.length > 0)
                return res.status(409).json({ message: "You have already reviewed this challenge." });

            next();
        });
    });
}

/**
 * Creates a new review and sends a 201 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createReview = (req, res, next) => {
    model.insertReview(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(201).json(results[1][0]);
    });
}

/**
 * Reads all reviews of the specified challenge and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readReviewsByChallengeId = (req, res, next) => {
    model.selectReviewByChallengeId(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware that reads the specified review and attaches it to the response locals.
 */
module.exports.readReviewByIds = selectOne(model.selectReviewByIds, "review", "Review not found.");

/**
 * Updates the specified review and sends a 204 response.
 */
module.exports.updateReviewByIds = (req, res, next) => {
    model.updateReviewByIds(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.status(204).end();
    });
}

module.exports.deleteReviewByIds = ensureDeleteById(model, "Review not found.", "deleteReviewByIds");