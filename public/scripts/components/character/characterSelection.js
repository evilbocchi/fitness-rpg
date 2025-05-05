import { getUserWithToken } from "../../queries/cache.js";
import api, { ACCESS_TOKEN, asyncApi } from "../../queries/query.js";
import { ELEMENT_CLASSES, getTextClassForElement } from "../elementColor.js";
import { createErrorCard } from "../error.js";
import { loadForm } from "../form.js";
import { showErrorToast } from "../toast.js";

/**
 * @typedef {{character_id: number, name: string, exp: number, element: string, health: number, mana: number}} UserCharacter
 */

/**
 * Append a character card to an element.
 * 
 * @param {HTMLElement} element The list to append the card to.
 * @param {UserCharacter} character The character.
 */
export function createCharacterCard(element, character, hideOptions = false) {
    element.insertAdjacentHTML("beforeend", `
    <div class="col-sm-3 bg-light-subtle my-2">
        <div class="card">
            <div class="card-body">
                <div class="card-title">
                    <h5 class="mb-0 fw-bold">${character.name}</h5>
                    <p class="mb-0 text-experience">
                        Total EXP: ${character.exp}<i class="bi bi-fan ms-1"></i>
                    </p>
                    <small class="${getTextClassForElement(character.element)}">${character.element}</small>
                </div>
                <div class="row mt-4">
                    <p class="col text-health mb-0">Health: ${character.health}<i class="bi bi-heart-fill ms-1"></i></p>
                    <p class="col text-mana mb-0 text-end">Mana: ${character.mana}<i class="bi bi-droplet-fill ms-1"></i></p>
                </div>
                <p class="description mb-1">
                    <span>
                        <a class="edit-button text-muted ms-1 d-none" href="#"><i class="bi bi-pencil-square"></i></a>
                        <a class="delete-button text-danger ms-1 d-none" href="#"><i class="bi bi-trash"></i></a>
                    </span>
                </p>
                <div class="character-options ${hideOptions ? "d-none" : ""}">
                    <hr>
                    <div class="d-flex justify-content-center">
                        <a class="btn btn-success emphasised" href="/character.html?character_id=${character.character_id}">Play!</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `);

    const card = element.lastElementChild;
    return card;
}


/**
 * Load basic information about character selection and creation.
 * 
 * @param {UserCharacter[]} characters The characters to load.
 */
export function loadCharactersInfo(characters) {
    const characterCount = document.getElementById("character-count");
    if (characterCount) {
        characterCount.textContent = characters.length;
        characterCount.classList.remove("text-loading");
    }

    const costLabels = document.getElementsByClassName("character-creation-cost");
    if (characters.length > 0) {
        for (const costLabel of costLabels)
            costLabel.classList.remove("d-none");
    }
    else {
        for (const costLabel of costLabels)
            costLabel.classList.add("d-none");
    }
}

export function loadCreationCosts() {
    const costLabels = document.getElementsByClassName("character-creation-cost");
    for (const costLabel of costLabels) {
        costLabel.insertAdjacentHTML("beforeend", `
        <span class="ms-1 badge text-bg-danger rounded-pill">
            <span>-500</span><i class="bi bi-brilliance ps-2"></i>
        </span>
        `);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    const characterList = document.getElementById("character-list");
    if (characterList == undefined)
        return;

    if (ACCESS_TOKEN == undefined) {
        window.location.href = "/login.html";
        return;
    }

    const [status, characters] = await asyncApi("GET", `/users/token/characters`, null, true);

    if (status !== 200) {
        showErrorToast(status, characters);
        return;
    }

    loadCreationCosts();
    loadCharactersInfo(characters);
    for (const character of characters) {
        createCharacterCard(characterList, character);
    }

    const createModalElement = document.getElementById("create-modal");
    if (createModalElement == undefined)
        return;


    const elementOptions = createModalElement.querySelector(".element-options");

    for (const [element, className] of Object.entries(ELEMENT_CLASSES)) {
        elementOptions.insertAdjacentHTML("beforeend", `
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="element" id="${element}" value="${element}">
            <label class="form-check-label text-${className}" for="${element}">${element.substring(0, 1).toUpperCase() + element.substring(1)}</label>
        </div>
        `);
    }

    const createButton = document.getElementById("create-character");
    createButton.classList.remove("d-none");
    const modal = new bootstrap.Modal(createModalElement);
    createButton.addEventListener("click", () => {
        modal.show();
    });

    const nameCharacterCount = document.querySelector(".name-character-count");
    const nameInput = document.getElementById("name");
    nameInput.addEventListener("input", () => {
        const length = nameInput.value.length;
        nameCharacterCount.textContent = `(${length}/30)`;
        if (length > 30) {
            nameCharacterCount.classList.add("text-danger");
            nameCharacterCount.classList.remove("text-muted");
        }
        else {
            nameCharacterCount.classList.remove("text-danger");
            nameCharacterCount.classList.add("text-muted");
        }
    });

    loadForm(document.getElementById("character-create-form"), (data, showError) => {
        if (data.name.length > 30) {
            showError("Name must be less than 30 characters.");
            return;
        }

        api("POST", "/character", data, true)((status, response) => {
            if (status !== 201) {
                showError(response.message);
                return;
            }

            characters.push(response);
            loadCharactersInfo(characters);
            createCharacterCard(characterList, response);
            modal.hide();
        });
    });
});