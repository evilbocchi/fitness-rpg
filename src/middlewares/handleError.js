/**
 * Middleware that checks for errors and sends a 500 response if present.
 * This will log and send a generic response message.
 *
 * @param {Error} error The Error object.
 * @param {import('express').Request} req The request object.
 * @param {import('express').Response} res The response object.
 * @param {import('express').NextFunction} next The next middleware function.
 */
module.exports.handleError = (error, req, res, next) => {
    if (error) {
        console.error("An internal server error occurred:", error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
    next();
}