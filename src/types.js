const pool = require("./services/db");
/**
 * @typedef {typeof pool.query} QueryFunction
 * @typedef {Parameters<QueryFunction>[2]} QueryCallback
 */