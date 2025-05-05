const { selectOne } = require("../middlewares/selection.js");
const { ensureDeleteById, updateAndSelectById } = require("../middlewares/byId.js");
const model = require("../models/userModel.js");
const userCompletionModel = require("../models/userCompletionModel.js");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Reads all users and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readAllUser = (req, res, next) => {
    model.selectAll((error, results) => {
        if (error)
            return next(error);

        res.status(200).json(results);
    });
}

/**
 * Middleware that retrieves the specified user and attaches it to the response locals.
 */
module.exports.readUserById = selectOne(model.selectById, "user");

/**
 * Middleware that retrieves the specified user by its username and attaches it to the response locals.
 */
module.exports.readUserByUsername = selectOne(model.selectByUsername, "user");

/**
 * Reads the specified user and sends a 200 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readUser = (req, res, next) => res.status(200).json(res.locals.user);

/**
 * Middleware that creates a new user and sends a 201 response if successful.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.createUser = (req, res, next) => {
    model.insertSingle(res.locals, (error, results) => {
        if (error)
            return next(error);

        res.locals.status = 201;
        res.locals.user_id = results.insertId;
        next();
    });
}

/**
 * Updates a user and sends a 200 response if successful.
 */
module.exports.updateUserById = updateAndSelectById(model, "User not found.");

/**
 * Middleware that ensures an email is in proper format.
 * Code from https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.validateEmail = (req, res, next) => {
    const result = res.locals.email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (result == null)
        return res.status(400).json({ message: "Invalid email." });

    next();
}

/**
 * Middleware to ensure the specified username or email in the response locals is not in use by a previous user.
 * Will ignore a specified user_id.
 * Else, sends a 409 response.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.checkUserAvailability = (req, res, next) => {
    model.selectByUsernameOrEmail(res.locals, (error, results) => {
        if (error)
            return next(error);

        if (results.length > 0 && results[0].user_id != res.locals.user_id)
            return res.status(409).json({ message: "Username or email is already in use." });

        next();
    });
}

/**
 * Middleware that attaches the user_id of the specified character to the response locals and retrieves the user.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.readUserByCharacter = (req, res, next) => {
    res.locals.user_id = res.locals.character.user_id;
    this.readUserById(req, res, next);
}