/**
 * @typedef {import('express').RequestHandler} RequestHandler
 * @typedef {import('*').QueryFunction} QueryFunction
 */

/**
 * Middleware factory that invokes `updateById` and `selectById` on a model to send the updated row as a 200 response.
 * 
 * @param {{updateById: QueryFunction, selectById: QueryFunction}} model The model to use for the update and select operations.
 * @param {string?} notFoundMsg Message to send if the data is not found.
 * @param {string?} key If specified, the updated row will be stored in `res.locals[key]` and the middleware will call `next()`.
 * @returns {RequestHandler} Middleware function.
 */
module.exports.updateAndSelectById = (model, notFoundMsg, key) => (req, res, next) => {
    model.updateById(res.locals, (error, results) => {
        if (error)
            return next(error);

        if (results.affectedRows == 0)
            return res.status(404).json({ message: notFoundMsg });

        model.selectById(res.locals, (error, results) => {
            if (error)
                return next(error);

            const updated = results[0];

            if (key) {
                res.locals[key] = updated;
                return next();
            }
             
            res.status(200).json(updated);
        });
    });
}

/**
 * Middleware factory that invokes `deleteById` on a model to send a 204 response if the row was deleted, or a 404 response if the row was not found.
 * 
 * @param {{deleteById: QueryFunction}} model The model to use for the delete operation.
 * @param {string?} notFoundMsg Message to send if the data is not found.
 * @param {string?} callbackKey If specified, the middleware will call `model[callbackKey]` instead of `model.deleteById`.
 * @returns {RequestHandler} Middleware function.
 */
module.exports.ensureDeleteById = (model, notFoundMsg, callbackKey) => (req, res, next) => {
    const callback = callbackKey ? model[callbackKey] : model.deleteById;
    callback(res.locals, (error, results) => {
        if (error)
            return next(error);

        if (results.affectedRows == 0)
            return res.status(404).json({ message: notFoundMsg });

        res.status(204).end();
    });
}
