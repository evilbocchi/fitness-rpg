/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Sends a 204 response with no content.
 * Used for equipping and other related endpoints that do not require a response body.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function.
 */
module.exports.noContent = (req, res, next) => {
    res.status(204).end();
}