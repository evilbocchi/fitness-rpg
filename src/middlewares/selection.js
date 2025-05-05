/**
 * @typedef {import('*').QueryFunction} QueryFunction
 * @typedef {import('express').RequestHandler} RequestHandler
 */

/**
 * Middleware factory that calls the specified callback, validating the results with the given
 * validation callback and sets the specified key with the transformed results in the response locals. 
 * If the `validation` callback is not true, a 404 response is given.
 *
 * @param {QueryFunction} callback The selection callback.
 * @param {string?} key Key to store the selection into the response locals. If not specified, the results are sent as a 200 response.
 * @param {((results: any) => boolean) | undefined} validation Validation callback to check if the data is valid. If not true, a 404 response is given.
 * @param {((results: any) => any) | undefined} transformer Transforms the results into another format into the response locals.
 * @param {string?} notFoundMsg Message to send if the data is not found.
 * @returns {RequestHandler} Middleware function.
*/
module.exports.select = (callback, key, validation, transformer, notFoundMsg) => (req, res, next) => {
    callback(res.locals, (error, results) => {
        if (error)
            return next(error);

        if (validation != undefined && validation(results) != true) {
            if (notFoundMsg == undefined) {
                const keyName = key.charAt(0).toUpperCase() + key.substring(1);
                notFoundMsg = `${keyName.replaceAll("_", " ")} not found.`;
            }
            return res.status(404).json({ message: notFoundMsg });
        }

        results = transformer == undefined ? results : transformer(results);

        if (key) {
            res.locals[key] = results;
            return next();
        }
        res.status(200).json(results);
    });
}

/**
 * Middleware factory that selects a row in a table with the specified model using 
 * the specified callback.
 * Stores the selected object in the response locals with the specified key.
 * If not found, sends a 404 response.
 *
 * @param {QueryFunction} callback The selection callback.
 * @param {string?} key Key to store the selection into the response locals. If not specified, the results are sent as a 200 response.
 * @param {string?} notFoundMsg Message to send if the data is not found.
*/
module.exports.selectOne = (callback, key, notFoundMsg) => {
    return this.select(callback, key, (results) => results.length > 0, (results) => results[0], notFoundMsg);
}

/**
 * Middleware factory that selects rows in a table with the specified model using 
 * the specified callback and calls the next middleware function with the response locals.
 * Stores the selected objects in the response locals with the specified key.
 * If not found, sends a 404 response.
 *
 * @param {QueryFunction} callback The selection callback.
 * @param {string?} key Key to store the selection into the response locals. If not specified, the results are sent as a 200 response.
 * @param {string?} notFoundMsg Message to send if the data is not found.
*/
module.exports.selectList = (callback, key, notFoundMsg) => {
    return this.select(callback, key, (results) => results.length > 0, (results) => results, notFoundMsg);
}

