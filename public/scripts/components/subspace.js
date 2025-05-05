import { SEARCH_PARAMS, enforceCharacterId } from "../queries/cache.js";
import api from "../queries/query.js";
import { getTextClassForElement } from "./elementColor.js";
import loadTeleports from "./teleports.js";
import { showErrorToast } from "./toast.js";

export function loadItem(item) {
    const item_icon = document.getElementById('item-icon');
    item_icon.src = `assets/game/item/${item.item_id}.png`;
    item_icon.alt = item.name;

    const name = document.getElementById('name');
    name.textContent = item.name;

    const lowercaseRarity = item.rarity.toLowerCase();

    const rarityWindows = document.getElementsByClassName('rarity-window');
    for (const window of rarityWindows) {
        window.classList.add("status-window-" + lowercaseRarity);
    }

    const attributes = document.getElementById('attributes');
    attributes.textContent = item.rarity + " " + item.slot;
    attributes.classList.add("text-" + lowercaseRarity);

    if (item.element) {
        const element = document.getElementById('element');
        element.textContent = item.element;
        element.classList.add(getTextClassForElement(item.element));
        element.classList.remove("d-none");
    }

    const power = document.getElementById('power');
    power.textContent = item.power;

    const req = document.getElementById('req');
    req.textContent = item.req;

    const equipButton = document.getElementById('equip');
    const unequipButton = document.getElementById('unequip');
    const useButton = document.getElementById('use');

    if (item.equipped) {
        equipButton.classList.add("d-none");
        unequipButton.classList.remove("d-none");
    }
    else {
        equipButton.classList.remove("d-none");
        unequipButton.classList.add("d-none");
    }

    if (item.effect_type) {
        equipButton.classList.add("d-none");
        useButton.classList.remove("d-none");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadTeleports();

    const character_id = enforceCharacterId();
    const ownership_id = SEARCH_PARAMS.get('ownership_id');

    api("GET", `/character/${character_id}/items/${ownership_id}`)((status, item) => {
        if (status !== 200) {
            showErrorToast(status, data);
            return;
        }

        const equipButton = document.getElementById('equip');
        const unequipButton = document.getElementById('unequip');
        const useButton = document.getElementById('use');
        const destroyButton = document.getElementById('destroy');

        equipButton.addEventListener("click", () => {
            api("POST", `/character/${character_id}/items/${ownership_id}/equip`, null, true)((status, data) => {
                if (status !== 204) {
                    showErrorToast(status, data);
                    return;
                }

                item.equipped = item.slot;
                loadItem(item);
            });
        });

        unequipButton.addEventListener("click", () => {
            api("POST", `/character/${character_id}/items/${ownership_id}/unequip`, null, true)((status, data) => {
                if (status !== 204) {
                    showErrorToast(status, data);
                    return;
                }

                item.equipped = null;
                loadItem(item);
            });
        });

        useButton.addEventListener("click", () => {
            api("POST", `/character/${character_id}/items/${ownership_id}/use`, null, true)((status, data) => {
                if (status !== 204) {
                    showErrorToast(status, data);
                    return;
                }

                window.location.href = `/character.html?character_id=${character_id}`;
            });
        });

        destroyButton.addEventListener("click", () => {
            if (!confirm("Are you sure you want to delete this item?"))
                return;

            api("DELETE", `/character/${character_id}/items/${ownership_id}/`, null, true)((status, data) => {
                if (status !== 204) {
                    showErrorToast(status, data);
                    return;
                }

                window.location.href = `/character.html?character_id=${character_id}`;
            });
        });

        loadItem(item);
    });
});