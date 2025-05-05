const pool = require("../services/db");
const path = require('path');
const fs = require("fs");

const SQLSTATEMENT = fs.readFileSync(path.resolve(__dirname, "./initStatement.sql")).toString();

pool.query(SQLSTATEMENT, (error) => {
    if (error) {
        console.error("Error creating tables:", error);
    } else {
        console.log("Tables created successfully");
    }
    process.exit();
});
