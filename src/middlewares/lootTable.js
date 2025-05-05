/**
 * Middleware to generate random items from a loot table.
 * 
 * @param {number} rolls Number of items to generate
 * @returns {import("express").RequestHandler} The middleware function.
 */
module.exports.getRandomLoot = (rolls) => (req, res, next) => {
    const lootTable = res.locals.lootTable;

    let totalWeight = 0;
    for (let [loot, weight] of lootTable) {
        weight *= 100;
        lootTable.set(loot, weight);
        totalWeight += weight;
    }

    if (res.locals.loot == undefined) {
        res.locals.loot = [];
    }
    
    const roll = () => {
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        for (const [loot, weight] of lootTable) {
            currentWeight += weight;
            if (random <= currentWeight) {
                res.locals.loot.push(loot);
                break;
            }
        }
    }
    for (let i = 0; i < rolls; i++)
        roll();

    next();
}