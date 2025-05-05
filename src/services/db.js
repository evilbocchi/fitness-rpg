require('dotenv').config(); //read .env file and set environment variables
const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 10, //set limit to 10 connection
    host: process.env.DB_HOST, //get host from environment variable
    user: process.env.DB_USER, //get user from environment variable
    password: process.env.DB_PASSWORD, //get password from environment variable
    database: process.env.DB_DATABASE, //get database from environment variable
    multipleStatements: true, //allow multiple sql statements
    dateStrings: true, //return date as string instead of Date object
    typeCast: (field, next) => {
        if (field.type === 'TINY' && field.length === 1) { // TINYINT(1) is typically used for booleans
            return field.string() === '1'; // Returns true for '1', false otherwise
        }
        return next();
    }
});

module.exports = pool;