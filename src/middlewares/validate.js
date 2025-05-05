/**
 * @typedef {import('express').RequestHandler} RequestHandler
 */

/**
 * Middleware factory to validate that a specified route parameter is a positive integer.
 * If valid, add the param directly to the response locals.
 *
 * @param {string} paramName The name of the route parameter to validate (e.g., "challenge_id" or "user_id").
 * @returns {RequestHandler} Express middleware function that checks if the specified parameter in `req.params`
 * is a positive integer. If validation fails, it sends a 400 error response with an appropriate message.
 *
 */
module.exports.validatePositiveIntegerParam = (paramName) => (req, res, next) => {
    const paramValue = Number.parseInt(req.params[paramName]);
    if (isNaN(paramValue) || paramValue < 1) {
        res.status(400).json({ message: `Invalid ${paramName} (${paramName}>0)` });
        return;
    }
    res.locals[paramName] = paramValue;
    next();
}

/**
 * Middleware factory to validate the presence of required fields in the request body.
 * If exists, add the fields directly to the response locals.
 *
 * @param {string[]} fields - An array of field names to validate in the request body.
 * @returns {RequestHandler} Express middleware function that checks if each field in `fields`
 * is present in `req.body`. If any field is missing or undefined, it sends a 400 error response
 * with a message specifying the missing field.
 * 
 */
module.exports.validateFields = (...fields) => (req, res, next) => {
    for (const field of fields) {
        const value = req.body[field];
        if (value == undefined) {
            return res.status(400).json({ message: `A required field is undefined: ${field}` });
        }
        res.locals[field] = value;
    }
    next();
}