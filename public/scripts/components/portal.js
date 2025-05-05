import { USER_OBSERVER, enforceCharacterId } from "../queries/cache.js";
import api, { asyncApi } from "../queries/query.js";
import { createItemSlot } from "./itemSlot.js";
import loadTeleports from "./teleports.js";
import { showErrorToast } from "./toast.js";

/**
 * Appends a dungeon card to the list.
 * 
 * @param {HTMLElement} element 
 * @param {*} dungeon 
 */
export function createDungeonCard(element, dungeon, character) {
    element.insertAdjacentHTML("beforeend", `
    <div class="dungeon-option status-window status-window-purple p-4 mb-3">
        <div class="background"></div>
        <h2 class="fw-bold text-center">${dungeon.name}</h2>
        <hr>
        <p class="text-center lead level-req text-clearer mb-0">Level Requirement: ${dungeon.req}</p>
        <p class="text-center lead fee text-clearer mb-0">Entry Fee: <span class="text-skillpoint">
                <span class="ms-2">${dungeon.fee}</span><i class="bi bi-brilliance px-2"></i>
            </span></p>
    </div>
    `);

    const card = element.lastElementChild;
    const background = card.querySelector(".background");
    background.style.setProperty("--status-window-image", `url('/assets/game/dungeon/${dungeon.dungeon_id}.jpg')`);

    const levelReq = card.querySelector(".level-req");
    if (character.level < dungeon.req) {
        levelReq.classList.add("text-danger");
    }
    else {
        levelReq.classList.add("text-success");
    }

    card.addEventListener("click", async () => {
        const [status, data] = await asyncApi("POST", `/dungeon/${dungeon.dungeon_id}/explore`, { character_id: character.character_id }, true);

        if (status !== 200) {
            showErrorToast(status, data);
            return;
        }

        const dungeonModal = document.getElementById("dungeon-modal");
        dungeonModal.querySelector(".message").textContent = data.message;
        dungeonModal.querySelector(".exp-gained").textContent = data.exp;
        dungeonModal.querySelector(".new-exp").textContent = data.new_exp;

        const lootList = dungeonModal.querySelector(".loot-list");
        lootList.replaceChildren();
        for (const loot of data.loot) {
            const slot = createItemSlot(loot);
            lootList.appendChild(slot);
        }
        dungeonModal.querySelector(".loot-count").textContent = data.loot.length;

        const levelledUpIndicator = dungeonModal.querySelector(".levelled-up");
        if (data.new_level) {
            levelledUpIndicator.classList.remove("d-none");
            dungeonModal.querySelector(".new-level").textContent = data.new_level;
        }
        else {
            levelledUpIndicator.classList.add("d-none");
        }

        const battleButton = dungeonModal.querySelector(".battle");
        if (data.battle_id) {
            battleButton.classList.remove("d-none");
        }
        else {
            battleButton.classList.add("d-none");
        }

        new bootstrap.Modal(dungeonModal).show();
        USER_OBSERVER.update();
    });
}

export function loadDungeonList(character) {
    const dungeonList = document.getElementById("dungeon-list");
    api("GET", `/dungeon`)((status, dungeons) => {
        if (status !== 200) {
            showErrorToast(status, data);
            return;
        }

        for (const dungeon of dungeons)
            createDungeonCard(dungeonList, dungeon, character);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    loadTeleports();
    const character_id = enforceCharacterId();

    const dungeonModal = document.getElementById("dungeon-modal");
    const battleButton = dungeonModal.querySelector(".battle");
    battleButton.addEventListener("click", () => {
        window.location.href = `/battlefield.html?character_id=${character_id}`;
    });

    api("GET", `/character/${character_id}`, null)((status, character) => {
        if (status !== 200) {
            showErrorToast(status, data);
            return;
        }

        loadDungeonList(character);
    });

});