import { enforceCharacterId, getUserWithToken, USER_OBSERVER } from "../../queries/cache.js";
import api, { asyncApi } from "../../queries/query.js";
import { loadForm } from "../form.js";
import { createItemSlot } from "../itemSlot.js";
import loadTeleports from "../teleports.js";
import { showErrorToast, showToast } from "../toast.js";

const character_id = enforceCharacterId();

/**
 * Load the inventory of the character.
 */
export function loadInventory() {
    const storage = document.getElementById("storage");
    const equipment = document.getElementById("equipment");

    api("GET", `/character/${character_id}/items`)((status, items) => {
        if (status !== 200) {
            showErrorToast(status, items);
        }

        let equipmentCount = 0;
        for (const item of items) {
            const slot = createItemSlot(item);
            if (item.equipped) {
                equipment.appendChild(slot);
                equipmentCount++;
            }
            else {
                storage.appendChild(slot);
            }
        }

        const emptyStorageIndicator = document.querySelector(".empty-storage");
        const emptyEquipmentIndicator = document.querySelector(".empty-equipment");
        if (items.length > 0)
            emptyStorageIndicator.classList.add("d-none");
        else
            emptyStorageIndicator.classList.remove("d-none");

        if (equipmentCount > 0)
            emptyEquipmentIndicator.classList.add("d-none");
        else
            emptyEquipmentIndicator.classList.remove("d-none");
    });
}

/**
 * Refresh the progress bar.
 * 
 * @param {HTMLElement} bar The progress bar.
 * @param {HTMLElement} text The text element of the progress bar.
 * @param {number} current The current value. 
 * @param {number} max The maximum value.
 * @param {string} suffix Any suffix to append to the text. 
 */
export function refreshBar(bar, text, current, max, suffix) {
    bar.style.width = `${current / max * 100}%`;
    text.textContent = `${current} / ${max} ${suffix}`;
}

/**
 * Append a request card to the element.
 * 
 * @param {HTMLElement} element The element to append the card to. 
 * @param {{character_name: string, exp: number, requester_user_id: number, username: string}} request The request.
 */
export function createRequestCard(element, request) {
    element.insertAdjacentHTML("beforeend", `
    <div class="border border-white col-sm-3 rounded-3 p-2 d-flex justify-content-between align-items-center">
        <p class="mb-0">${request.character_name} from <a href="/profile.html?user_id=${request.requester_user_id}" class="link-light">${request.username}</a>
        (${request.exp} EXP)</p>
        <div>
            <button class="text-danger text-clearer mx-1 border-0 bg-transparent cancel"><i class="bi bi-x-square"></i></button>
            <button class="text-success text-clearer mx-1 border-0 bg-transparent accept"><i class="bi bi-check-lg"></i></button>
        </div>
    </div>
    `);
    const card = element.lastElementChild;

    card.querySelector(".cancel").addEventListener("click", async () => {
        const [status, data] = await asyncApi("DELETE", `/battle/request/${request.request_id}`, { character_id }, true);

        if (status !== 204) {
            showErrorToast(status, data);
            return;
        }

        card.remove();
    });

    card.querySelector(".accept").addEventListener("click", async () => {
        const [status, data] = await asyncApi("POST", `/battle`, { attacker_id: request.requester_id, defender_id: character_id }, true);
        if (status !== 201) {
            showErrorToast(status, data);
            return;
        }

        window.location.href = `/battlefield.html?character_id=${character_id}`;
    });

    return card;
}

/**
 * Load the incoming requests.
 * 
 */
export function loadRequests() {
    const requestsList = document.getElementById("incoming-requests");
    const emptyRequestsIndicator = document.getElementById("empty-requests");

    api("GET", `/users/token/requests`, null, true)((status, requests) => {
        if (status !== 200) {
            showErrorToast(status, requests);
            return;
        }

        for (const request of requests) {
            createRequestCard(requestsList, request);
        }

        if (requests.length > 0)
            emptyRequestsIndicator.classList.add("d-none");
        else
            emptyRequestsIndicator.classList.remove("d-none");
    });
}

/**
 * Refresh the character information window.
 * 
 * @param {{name: string, level: number, exp: number, max_exp: number, health: number, max_health: number, mana: number, max_mana: number}} character The character object.
 */
export function refreshCharacterInfo(character) {
    const characterName = document.getElementById("character-name");
    characterName.textContent = character.name;

    const characterLevel = document.getElementById("character-level");
    characterLevel.textContent = character.level;

    const expBar = document.getElementById("exp-bar");
    const expText = document.getElementById("exp");
    const healthBar = document.getElementById("health-bar");
    const healthText = document.getElementById("health");
    const manaBar = document.getElementById("mana-bar");
    const manaText = document.getElementById("mana");

    refreshBar(expBar, expText, character.exp, character.max_exp, "EXP");
    refreshBar(healthBar, healthText, character.health, character.max_health, "Health");
    refreshBar(manaBar, manaText, character.mana, character.max_mana, "Mana");
}

window.addEventListener("DOMContentLoaded", () => {
    loadTeleports();
    loadRequests();

    const recoverButton = document.getElementById("recover");

    const updateCharacter = (callback) => {
        api("GET", `/character/${character_id}`)((status, character) => {
            if (status !== 200) {
                showErrorToast(status, character);
                return;
            }

            refreshCharacterInfo(character);
            if (character.health == character.max_health && character.mana == character.max_mana)
                recoverButton.classList.add("d-none");
            else
                recoverButton.classList.remove("d-none");

            callback(character);
        });
    }

    updateCharacter(loadInventory);

    recoverButton.addEventListener("click", () => {
        api("POST", `/character/${character_id}/recover`, null, true)((status, data) => {
            if (status !== 200) {
                showErrorToast(status, data);
                return;
            }

            showToast("recovered", "Recovered", data.message);
            updateCharacter(() => {
                USER_OBSERVER.update();
            });
        });
    });

    loadForm(document.getElementById("request-form"), (data, showError) => {
        data.character_id = character_id;

        api("POST", `/battle/request`, data, true)((status, data) => {
            if (status !== 201) {
                showError(data.message);
                return;
            }

            showToast("requested", "Requested", data.message);
        });
    });
});
