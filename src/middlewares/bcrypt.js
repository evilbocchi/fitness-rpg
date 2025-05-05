const bcrypt = require('bcrypt');

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const saltRounds = 10;
const PEPPER = process.env.PEPPER;

/**
 * Middleware that compares the password in the request body to the hashed password in the response locals.
 * This should be called after the user has been retrieved from the database, where the hashed password will be searched for.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function. 
 */
module.exports.comparePassword = (req, res, next) => {
    let attempting = req.body.password;
    const user = res.locals.user;
    if (user != undefined) {
        for (const [key, value] of Object.entries(user))
            res.locals[key] = value;
    }
    
    attempting += PEPPER;
    bcrypt.compare(attempting, res.locals.password, (error, isMatch) => {
        if (error)
            return next(error);

        if (isMatch)
            return next();

        res.status(401).json({ message: "Incorrect password." });
    });
};

/**
 * Middleware that hashes the password in the request body and stores it in the response locals.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function. 
 */
module.exports.hashPassword = (req, res, next) => {
    let password = req.body.password;
    if (password == undefined)
        return res.status(400).json({ message: "A password is required." });

    password += PEPPER;
    bcrypt.hash(password, saltRounds, (error, hash) => {
        if (error)
            return next(error);

        res.locals.password = hash;
        next();
    });
};