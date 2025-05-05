const pool = require('../services/db');

/**
 * @typedef {import('../types').QueryCallback} QueryCallback
 */

/**
 * Retrieves all skills in the Skill table and invokes the callback with the results.
 * 
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Skill;
    `;
    pool.query(SQLSTATEMENT, callback);
}

/**
 * Retrieves the specified skill in the Skill table and invokes the callback with the results.
 * 
 * @param {{skill_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Skill
    WHERE skill_id = ?;
    `;
    const VALUES = [data.skill_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Retrieves the specified skill by its name in the Skill table and invokes the callback with the results.
 * 
 * @param {{name: string}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.selectByName = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Skill
    WHERE name = ?;
    `;
    const VALUES = [data.name];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Inserts a new skill in the Skill table, retrieves the inserted row and invokes the callback with the results.
 * 
 * @param {{name: string, description: string, skillpoint_purchase_cost: number, element: string, accuracy: number, damage: number, mana_cost: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Skill (name, description, skillpoint_purchase_cost, element, accuracy, damage, mana_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    SELECT * FROM Skill WHERE skill_id = LAST_INSERT_ID();
    `;
    const VALUES = [data.name, data.description, data.skillpoint_purchase_cost, data.element, data.accuracy, data.damage, data.mana_cost];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Updates the specified skill in the Skill table and invokes the callback with the results.
 * 
 * @param {{skill_id: number, name: string, description: string, skillpoint_purchase_cost: number, element: string, accuracy: number, damage: number, mana_cost: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE Skill 
    SET name = ?, description = ?, skillpoint_purchase_cost = ?, element = ?, accuracy = ?, damage = ?, mana_cost = ?
    WHERE skill_id = ?;
    `;
    const VALUES = [data.name, data.description, data.skillpoint_purchase_cost, data.element, data.accuracy, data.damage, data.mana_cost, data.skill_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

/**
 * Deletes the specified skill in the Skill table and invokes the callback with the results.
 * 
 * @param {{skill_id: number}} data Data object
 * @param {QueryCallback} callback Asynchronous callback
 */
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM Skill 
    WHERE skill_id = ?;
    `;
    const VALUES = [data.skill_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}