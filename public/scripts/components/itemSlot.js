import { getTextClassForElement } from "./elementColor.js";
import { enforceCharacterId } from "../queries/cache.js";

/**
 * @typedef {import("bootstrap")} bootstrap
 * @typedef {{item_id: number, name: string, power: number, req: number, slot: string, rarity: string, element: string}} Item
 */

const character_id = enforceCharacterId();


/**
 * Create an item slot element.
 * 
 * @param {Item} item The item.
 */
export function createItemSlot(item) {
    const slot = document.createElement('div');
    slot.classList.add('col-sm', 'inventory-slot');

    const rarity = item.rarity;
    
    slot.insertAdjacentHTML("beforeend", `
    <a class="d-block inventory-slot-button ${rarity ? rarity.toLowerCase() : ''} p-1" href="/subspace.html?character_id=${character_id}&ownership_id=${item.ownership_id}">
        <img src="assets/game/item/${item.item_id}.png" class="img-fluid">
    </a>
    `);

    slot.setAttribute('data-bs-toggle', 'tooltip');
    slot.setAttribute('data-bs-html', 'true');
    slot.setAttribute('data-bs-title', `
    <b>${item.name}</b><br>
    <span class="text-danger">${item.power} Power</span><br>
    <span class="text-warning">Min. Level: ${item.req}</span><br>
    
    <span class="rarity mt-2 small ${getTextClassForElement(item.element)} text-${item.rarity.toLowerCase()}">${item.rarity} ${item.slot}</span>
    `);

    new bootstrap.Tooltip(slot);
    return slot;
}