import { enforceCharacterId } from "../queries/cache.js";
import api, { asyncApi } from "../queries/query.js";
import { getTextClassForElement } from "./elementColor.js";
import { createItemSlot } from "./itemSlot.js";
import { loadList } from "./list.js";
import loadTeleports from "./teleports.js";
import { showErrorToast } from "./toast.js";

/**
 * @typedef {{ending_health: number, ending_mana: number}} FighterEndingInfo
 * @typedef {{attacker: FighterEndingInfo, defender: FighterEndingInfo, result: string, effectResult: string}} EndingLog
 * @typedef {{monster_id: number, health: number, max_health: number, name: string, character_id: number, mana?: number, max_mana?: number}} Fighter
 * @typedef {{battle_id: number, attacker_id: number, defender_id?: number, monster_id?: number, monster_health?: number, monster_max_health?: number, monster_name?: string, attacker?: Fighter, defender?: Fighter, finished: boolean, logs: EndingLog[]}} Battle
 */

/**
 * @type {Battle} The current battle.
 */
let battle = undefined;

let lastProcessedTurn = 0;

/**
 * Create a fighter in the battlefield.
 * 
 * @param {HTMLElement} element The parent element to append the fighter to.
 * @param {Fighter} fighter The fighter object.
 * @param {boolean} mirrored Whether the fighter is mirrored.
 */
export function createFighter(element, fighter, mirrored = false) {
    element.insertAdjacentHTML("beforeend", `
    <div class="${mirrored ? "second-person" : "first-person"}-container d-flex flex-column justify-content-center align-items-center position-relative">
        <div class="fighter-info">
            <h2 class="text-center name">Player</h2>
            <div class="progress drop-shadow mb-1" role="progressbar">
                <i class="bi bi-heart-fill ms-1 text-white"></i>
                <div class="health-bar progress-bar bg-health"></div>
                <p class="health" class="position-absolute text-white text-center mb-0"></p>
            </div>
            <div class="progress drop-shadow" role="progressbar">
                <i class="bi bi-droplet-fill ms-1 text-white"></i>
                <div class="mana-bar progress-bar bg-mana"></div>
                <p class="mana" class="position-absolute text-white text-center mb-0"></p>
            </div>
        </div>
        <img src="assets/game/monster/human.png" class="fighter-image">
    </div>
    `);

    const container = element.lastElementChild;
    const image = container.querySelector(".fighter-image");
    image.src = `assets/game/monster/${fighter.monster_id ?? "human"}.png`;

    const name = container.querySelector(".name");
    name.textContent = fighter.name;

    container.id = "character_" + (fighter.character_id ?? 0);

    refreshFighter(container, fighter);
}

/**
 * Refreshes the health and mana of a fighter in the battlefield.
 * 
 * @param {HTMLElement} container 
 * @param {Fighter} fighter 
 */
export function refreshFighter(container, fighter) {
    const health = container.querySelector(".health");
    const healthBar = container.querySelector(".health-bar");
    const mana = container.querySelector(".mana");
    const manaBar = container.querySelector(".mana-bar");

    if (fighter.health != undefined) {
        health.textContent = `${fighter.health}/${fighter.max_health} Health`;
        healthBar.style.width = `${(fighter.health / fighter.max_health) * 100}%`;
    }

    if (fighter.mana != undefined) {
        mana.textContent = `${fighter.mana}/${fighter.max_mana} Mana`;

        manaBar.style.width = `${(fighter.mana / fighter.max_mana) * 100}%`;
        manaBar.parentElement.classList.remove("d-none");
    }
    else {
        manaBar.parentElement.classList.add("d-none");
    }
}

/**
 * Refreshes the options in the battlefield.
 * 
 * @param {string} tab The tab to open.
 */
export function refreshOptions(tab) {
    const actionTitle = document.getElementById("action-title");
    const options = document.getElementById(tab);
    for (const actionOptions of document.querySelectorAll(".action-options")) {
        actionOptions.classList.add("d-none");
    }

    let text = undefined;
    switch (tab) {
        case "main-options":
            text = "What are you going to do?";
            break;
        case "skill-options":
            text = "Choose a skill to use.";
            break;
        case "heal-options":
            text = "Heal up while you still can.";
            break;
    }
    if (text) {
        actionTitle.textContent = text;
        actionTitle.classList.remove("d-none");
    }
    else {
        actionTitle.classList.add("d-none");
    }

    if (options) {
        options.classList.remove("d-none");
    }
}

/**
 * Create a function that cycles through logs, producing its ending state.
 * Once the logs are exhausted, the function will return the final state of the battle.
 * Any subsequent calls will return undefined.
 * 
 * @param {any} response Response object from battle endpoints.
 * @returns {() => EndingLog} A function that returns the next log.
 */
export function createLogCycler(response) {
    let i = 0;
    const logs = response.logs;
    return () => {
        const log = logs[i];
        if (log == undefined)
            return;

        const nextLog = logs[++i];
        if (nextLog == undefined) {
            log.attacker.ending_health = response.attacker.health;
            log.attacker.ending_mana = response.attacker.mana;
            log.defender.ending_health = response.defender.health;
            log.defender.ending_mana = response.defender.mana;
            log.last = true;
        }
        else {
            log.attacker.ending_health = nextLog.attacker.starting_health;
            log.attacker.ending_mana = nextLog.attacker.starting_mana;
            log.defender.ending_health = nextLog.defender.starting_health;
            log.defender.ending_mana = nextLog.defender.starting_mana;
        }

        return log;
    }
}

/**
 * Displays a line of text. Disappears after a set amount of time.
 * 
 * @param {string} line The line to display.
 * @param {Function} nextCallback A callback to execute to cue the next line.
 */
export function showLine(line, nextCallback) {
    const text = document.createElement("p");
    text.textContent = line;
    text.classList.add("mb-0");
    text.style.fontSize = 0;
    document.getElementById("result").appendChild(text);

    setTimeout(() => {
        text.style.fontSize = "1.25rem"; // use transition to animate instead of css animations
        const delay = 700 + 40 * line.length;
        setTimeout(nextCallback, delay);
        setTimeout(() => {
            text.style.fontSize = 0;
        }, delay + 2000);
    }, 50);
}

/**
 * Displays a secondary line of text. Disappears after a set amount of time.
 * 
 * @param {string} line The line to display.
 */
export function showSecondaryLine(line) {
    const text = document.createElement("p");
    text.insertAdjacentHTML("beforeend", line.replace("\n", "<br>"));
    text.classList.add("mb-0", "text-white-50");
    text.style.fontSize = 0;
    document.getElementById("result").appendChild(text);
    setTimeout(() => {
        text.style.fontSize = "1rem";
        setTimeout(() => {
            text.style.fontSize = 0;
        }, 700 + 40 * line.length + 4000);
    }, 500);
}

/**
 * Checks if it is the current player's turn.
 * 
 * @param {number} turn The current turn.
 * @returns {boolean} True if it is the player's turn, false otherwise.
 */
export function isYourTurn(turn) {
    return (battle.attacker_id == enforceCharacterId()) == (turn % 2 == 0);
}

/**
 * Processes a move in the battle.
 * This function will animate the battle log and update the fighters' health and mana.
 * 
 * @param {EndingLog} log The log to process.
 * @param {Function} callback Executes after the move is processed.
 */
export function processMove(log, callback) {
    if (log == undefined) {
        if (battle.monster_id != undefined) {
            refreshOptions("main-options");
        }
        else {
            if (isYourTurn(battle.turns)) {
                refreshOptions("main-options");
            }
            else {
                poll();
            }
        }
        return;
    }

    refreshOptions();

    const message = log.result;
    const effectMessage = log.effectResult;

    const lines = message.split("\n");

    let index = 0;
    let ending = false;
    const writeLine = () => {
        if (index >= lines.length && ending == false) {
            callback();
            return;
        }

        const line = lines[index];
        showLine(line, writeLine);
        const attackerInfo = document.getElementById("character_" + battle.attacker_id);
        const defenderInfo = document.getElementById("character_" + (battle.defender_id ?? 0));

        if (index == 0) {
            refreshFighter(attackerInfo, { mana: log.attacker.ending_mana, max_mana: battle.attacker.max_mana });

            if (battle.monster_id == undefined)
                refreshFighter(defenderInfo, { mana: log.defender.ending_mana, max_mana: battle.defender.max_mana });
        }
        else if (index > 0) {
            log.attacker.health = Math.max(0, log.attacker.ending_health);
            log.attacker.max_health = battle.attacker.max_health;
            log.attacker.mana = log.attacker.ending_mana;
            log.attacker.max_mana = battle.attacker.max_mana;

            log.defender.health = Math.max(0, log.defender.ending_health);
            if (battle.monster_id != undefined) {
                log.defender.max_health = battle.monster_max_health;
            }
            else {
                log.defender.max_health = battle.defender.max_health;
                log.defender.mana = log.defender.ending_mana;
                log.defender.max_mana = battle.defender.max_mana;
            }
            refreshFighter(attackerInfo, log.attacker);
            refreshFighter(defenderInfo, log.defender);
        }

        if (++index == lines.length) {
            if (log.last && (log.attacker.health <= 0 || log.defender.health <= 0)) {
                ending = true;
                setTimeout(() => {
                    window.location.href = `/character.html?character_id=${enforceCharacterId()}`;
                }, 2000);
                return;
            }

            if (effectMessage != "" && effectMessage != undefined) {
                showSecondaryLine(effectMessage);
            }
        }
    }
    writeLine();
}

/**
 * Processes the moves sent in the response.
 * 
 * @param {any} response Response object from battle endpoints.
 */
export function processMoves(response) {
    lastProcessedTurn = battle.turns;
    document.getElementById("result").replaceChildren();
    const nextEndingLog = createLogCycler(response);

    const cycle = () => processMove(nextEndingLog(), cycle);
    cycle();
}

/**
 * Loads battle information and its fighters into the page.
 */
export async function loadBattle() {
    const character_id = enforceCharacterId();
    const [status, response] = await asyncApi("GET", `/character/${character_id}/battle`);
    if (status === 404) {
        window.location.href = `/character.html?character_id=${character_id}`;
        return;
    }
    if (status !== 200) {
        showErrorToast(status, response);
        return;
    }
    battle = response;

    const attacker = battle.attacker;
    const defender = battle.defender;

    const fighters = document.getElementById("fighters");

    if (battle.monster_id == undefined) { // PvP
        const isAttackerFirstPerson = attacker.character_id == character_id;
        if (isAttackerFirstPerson) {
            createFighter(fighters.firstElementChild, attacker, false);
            createFighter(fighters.lastElementChild, defender, true);
        }
        else {
            createFighter(fighters.firstElementChild, defender, false);
            createFighter(fighters.lastElementChild, attacker, true);
        }
    }
    else { // PvE
        createFighter(fighters.firstElementChild, attacker, false);
        const monster = {
            monster_id: battle.monster_id,
            health: battle.monster_health,
            max_health: battle.monster_max_health,
            name: battle.monster_name
        }
        createFighter(fighters.lastElementChild, monster, true);
    }
}

/**
 * Manually update a character's health and mana by fetching the latest data.
 * 
 * @param {number} character_id The character's ID.
 */
export function updateCharacter(character_id) {
    api("GET", `/character/${character_id}`)((status, character) => {
        if (status !== 200) {
            showErrorToast(status, character);
            return;
        }

        refreshFighter(document.getElementById("character_" + character_id), character);
    });
}

/**
 * Function to be called when the poll event is triggered.
 */
export async function poll(callback) {
    if (battle != undefined && battle.monster_id != undefined) {
        refreshOptions("main-options");
        return;
    }

    let url;
    if (battle == undefined) {
        url = `/character/${enforceCharacterId()}/battle`;
    }
    else {
        if (battle.finished) {
            window.location.href = `/character.html?character_id=${enforceCharacterId()}`;
            return;
        }

        url = `/battle/${battle.battle_id}`;
    }

    const [status, response] = await asyncApi("GET", url);

    if (status !== 200) {
        showErrorToast(status, response);
        setTimeout(window.location.reload, 1000);
        return;
    }
    battle = response;
    const turns = battle.turns;

    if (!isYourTurn(turns)) {
        refreshOptions("waiting");
        setTimeout(poll, 2000);
        return;
    }

    if (turns > lastProcessedTurn) { // new moves, process them
        const log = battle.last;
        battle.logs = [log];

        log.attacker = { starting_health: battle.attacker.health, starting_mana: battle.attacker.mana };
        log.defender = { starting_health: battle.defender.health, starting_mana: battle.defender.mana };

        processMoves(response);
    }

    if (callback)
        callback();
}

/**
 * Creates a skill option to be used in skill selection.
 */
export function createSkillButton(skill) {
    const button = document.createElement("button");
    button.classList.add("col-auto", "skill-option", "skill", getTextClassForElement(skill.element));
    button.textContent = skill.name;
    button.addEventListener("click", () => {
        api("POST", `/battle/${battle.battle_id}/skill`, { skill_id: skill.skill_id }, true)((status, response) => {
            if (status !== 200) {
                showErrorToast(status, response);
                return;
            }

            battle.turns += 1;
            processMoves(response);
        });
    });
    return button;
}

/**
 * Loads a healing slot to be used in healing selection.
 * 
 * @param {HTMLElement} slot The slot to load for interaction.
 * @param {{ownership_id: number, name: string}} item The item to load.
 */
export function loadHealingSlot(slot, item) {
    slot.addEventListener("click", (event) => {
        event.preventDefault();
        const character_id = enforceCharacterId();
        api("POST", `/character/${character_id}/items/${item.ownership_id}/use`, null, true)((status, response) => {
            if (status !== 204) {
                showErrorToast(status, response);
                return;
            }

            showSecondaryLine(`Used ${item.name}.`);
            slot.classList.add("d-none"); // usually the slot should be removed but the tooltip would still be visible
            updateCharacter(character_id);
        });
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    loadTeleports();
    const character_id = enforceCharacterId();

    await loadBattle();

    poll();
    if (isYourTurn(battle.turns)) {
        refreshOptions("main-options");
    }
    const battle_id = battle.battle_id;

    const skillList = document.getElementById("skill-list");
    loadList(skillList);

    api("GET", `/character/${character_id}/skills/detailed`, null)((status, skills) => {
        if (status !== 200) {
            showErrorToast(status, skills);
            return;
        }

        for (const skill of skills) {
            skillList.appendChild(createSkillButton(skill));
        }

        if (skills.length == 0) {
            const text = document.createElement("p");
            text.classList.add("text-center", "text-white", "m-auto");
            text.insertAdjacentHTML("beforeend", `
                    No skills available. Get some at the <a href="/tavern.html?character_id=${character_id}" class="link-info">Tavern</a>.
                `);
            skillList.appendChild(text);
        }
    });

    api("GET", `/character/${character_id}/items`, null)((status, items) => {
        if (status !== 200) {
            showErrorToast(status, items);
            return;
        }

        const healList = document.getElementById("heal-list");
        let potionCount = 0;
        for (const item of items) {
            if (item.effect_type != "Health")
                continue;

            const slot = createItemSlot(item);
            loadHealingSlot(slot, item);
            healList.appendChild(slot);
            ++potionCount;
        }

        if (potionCount == 0) {
            const text = document.createElement("p");
            text.classList.add("text-center", "text-white", "m-auto");
            text.insertAdjacentHTML("beforeend", `You have no potions.`);
            healList.appendChild(text);
        }
    });

    document.getElementById("fight").addEventListener("click", () => {
        refreshOptions("skill-options");
    });

    document.getElementById("heal").addEventListener("click", () => {
        refreshOptions("heal-options");
    });


    document.getElementById("guard").addEventListener("click", async () => {
        const [status, response] = await asyncApi("POST", `/battle/${battle_id}/guard`, null, true);

        if (status !== 200) {
            showErrorToast(status, response);
            return;
        }

        battle.turns += 1;
        processMoves(response);
    });

    document.getElementById("forfeit").addEventListener("click", async () => {
        if (!confirm("Are you sure you want to forfeit the battle?"))
            return;

        const [status, response] = await asyncApi("POST", `/battle/${battle_id}/forfeit`, null, true);
        if (status !== 200) {
            showErrorToast(status, response);
            return;
        }

        window.location.href = `/character.html?character_id=${character_id}`;
    });

    for (const backButton of document.getElementsByClassName("back-main")) {
        backButton.addEventListener("click", () => {
            refreshOptions("main-options");
        });
    }
});