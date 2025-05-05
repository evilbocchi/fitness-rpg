/**
 * Calculate the level of an amount of total experience points.
 * 
 * @param {number} exp Total experience points
 * @returns Level
 */
module.exports.getLevel = (exp) => {
    let level = (Math.log((exp + 853) / 80) / Math.log(1.1)) - 25;
    if (level < 0)
        level = 0;
    level = Math.floor(level + 1);
    return level;
}

/**
 * Calculate the maximum amount of experience points for a level.
 * 
 * @param {number} level Level 
 * @returns Maximum experience points
 */
module.exports.getMaxExp = (level) => {
    if (level < 1)
        return 0;
    return Math.floor((80 * Math.pow(1.1, level + 25)) - 853);
}