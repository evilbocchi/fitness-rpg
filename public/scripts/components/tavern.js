import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.mjs';
import { enforceCharacterId, USER_OBSERVER } from "../queries/cache.js";
import api, { asyncApi } from "../queries/query.js";
import { ELEMENT_CLASSES, getTextClassForElement } from "./elementColor.js";
import loadTeleports from "./teleports.js";
import { showErrorToast, showToast } from "./toast.js";

const character_id = enforceCharacterId();

/**
 * Append a skill card to an element.
 * 
 * @param {HTMLElement} element The list to append the card to.
 * @param {Skill} skill The skill.
 */
export function createSkillCard(element, skill, purchased = false) {
    element.insertAdjacentHTML("beforeend", `
    <div class="col-sm-6 mt-3 mb-2">
        <div class="status-window py-3 px-4 tavern-option">
            <div class="background"></div>
            <div>
                <h5 class="mb-0 fw-bold text-clearer title"></h5>
                <p class="mb-0 description"></p>
                <hr>
                <p class="mb-0 text-health text-clearer">Damage: <span class="damage"></span><i class="bi bi-heart-fill ms-1"></i></p>
                <p class="mb-0 text-mana text-clearer">Mana Penalty: <span class="mana-cost"></span><i class="bi bi-droplet-fill ms-1"></i></p>
            </div>
            <button></button>
        </div>
    </div>
    `);
    const card = element.lastElementChild;
    refreshSkillCard(card, skill, purchased);

    const button = card.querySelector("button");
    button.addEventListener("click", () => {
        if (purchased)
            return;

        api("POST", `/character/${character_id}/skills`, { skill_id: skill.skill_id }, true)((status, response) => {
            if (status !== 201) {
                showErrorToast(status, response);
                return;
            }

            purchased = true;
            refreshSkillCard(card, skill, purchased);
            showToast("skill-learned", "Skill Learned", `You have learned the skill ${skill.name}.`);
            USER_OBSERVER.update();
        });
    });
    return card;
}

export function refreshSkillCard(card, skill, purchased = false) {
    const statusWindow = card.querySelector(".status-window");
    statusWindow.classList.add(`status-window-${ELEMENT_CLASSES[skill.element.toLowerCase()]}`);

    const title = card.querySelector(".title");
    title.classList.add(getTextClassForElement(skill.element));
    title.textContent = skill.name;

    const description = card.querySelector(".description");
    description.textContent = skill.description;

    const damage = card.querySelector(".damage");
    damage.textContent = skill.damage;

    const manaCost = card.querySelector(".mana-cost");
    manaCost.textContent = skill.mana_cost;

    const button = card.querySelector("button");
    button.className = `btn btn-${purchased ? "success" : "primary"} emphasised`;
    button.replaceChildren();
    button.insertAdjacentHTML("beforeend", purchased ? "Learned" : `Learn (-${skill.skillpoint_purchase_cost}<i class="bi bi-brilliance ms-1"></i>)`);
}


window.addEventListener("DOMContentLoaded", async () => {
    if (character_id == undefined) {
        window.location.href = "/characters.html";
        return;
    }
    loadTeleports();

    const skillList = document.getElementById("skill-list");

    const loadSkills = (skills, purchasedSkills) => {
        const cards = new Array();
        for (const skill of skills) {
            const card = createSkillCard(skillList, skill, purchasedSkills.includes(skill.skill_id));
            cards.push(card);
        }

        const fuse = new Fuse(cards, {
            keys: ["textContent"],
            includeScore: true
        });

        const searchInput = document.getElementById("search");
        searchInput.addEventListener("input", () => {
            const query = searchInput.value;
            if (query.length === 0) {
                for (const card of cards) {
                    card.classList.remove("d-none");
                }
                return;
            }

            const results = fuse.search(query);
            for (const card of cards) {
                card.classList.add("d-none");
            }
            for (const { item } of results) {
                item.classList.remove("d-none");
            }
        });
    }

    const [status, skills] = await asyncApi("GET", "/skills");

    if (status !== 200) {
        showErrorToast(status, skills);
        return;
    }

    api("GET", `/character/${character_id}/skills`)((status, purchasedSkills) => {
        if (status !== 200) {
            showErrorToast(status, purchasedSkills);
            return;
        }

        loadSkills(skills, purchasedSkills);
    });
});