const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const tokenDuration = process.env.JWT_EXPIRES_IN;
const refreshTokenDuration = process.env.JWT_REFRESH_EXPIRES_IN;
const tokenAlgorithm = process.env.JWT_ALGORITHM;

/**
 * Middleware that generates a JWT token with the user ID in either the response locals or response locals.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function. 
 */
module.exports.generateToken = (req, res, next) => {
    const payload = {
        user_id: res.locals.user_id,
        timestamp: new Date()
    };

    res.locals.token = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        algorithm: tokenAlgorithm,
        expiresIn: tokenDuration
    });

    const user = res.locals.user ?? {};
    user.token = res.locals.token;

    const status = res.locals.status ?? 200;
    let refreshToken = "";
    const rememberme = res.locals.rememberme;
    if (rememberme === true) {
        refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
            algorithm: tokenAlgorithm,
            expiresIn: refreshTokenDuration
        });

        const clientRefreshTokenDuration = 31536000; // 1 year
        res.setHeader("Set-Cookie", `refreshToken=${refreshToken}; path=/; max-age=${clientRefreshTokenDuration}; secure; samesite=strict; httponly`);
    }
    else if (rememberme === false) {
        res.setHeader("Set-Cookie", `refreshToken=; path=/; max-age=0; secure; samesite=strict; httponly`);
    }
    
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.status(status).json(user);
}

/**
 * Verifies the token in the Authorization header and stores the user ID in the response locals.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function. 
 */
module.exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader == undefined || !authHeader.startsWith('Bearer ') || authHeader.length < 8)
        return res.status(401).json({ message: 'No token provided.' });

    const token = authHeader.substring(7);

    jwt.verify(token, ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error)
            return res.status(401).json({ message: "Invalid token." });

        const userId = decoded.user_id;

        res.locals.user_id = userId;
        res.locals.token_timestamp = decoded.timestamp;
        next();
    });
}

/**
 * Uses a refresh token to verify the user's identity and store the user ID in the response locals.
 * Afterwards, generateToken can be used to create a new access token.
 * 
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {NextFunction} next The next middleware function. 
 */
module.exports.refreshToken = (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken == undefined)
        return res.status(401).json({ message: 'No token provided.' });

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (error, decoded) => {
        if (error)
            return res.status(401).json({ message: "Invalid token." });

        res.locals.user_id = decoded.user_id;
        res.locals.token_timestamp = decoded.timestamp;

        next();
    });
}