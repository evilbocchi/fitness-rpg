import { getUserWithToken, SEARCH_PARAMS } from "../queries/cache.js";
import api from "../queries/query.js";
import { loadChallengeRecordCard } from "./challenge/record.js";
import { createCharacterCard, loadCharactersInfo } from "./character/characterSelection.js";
import { loadList } from "./list.js";
import { showErrorToast } from "./toast.js";

/**
 * Load the profile of a user.
 * 
 * @param {{username: string, skillpoints: number, user_id: number}} user The user. 
 */
export function loadProfile(user) {
    const main = document.querySelector("main");
    const usernameLabel = main.querySelector(".username");
    const skillpointsLabel = main.querySelector(".skillpoints");
    const recordCountLabel = main.querySelector(".record-count");
    const recordList = main.querySelector(".record-list");

    usernameLabel.textContent = user.username;
    skillpointsLabel.textContent = user.skillpoints;

    api("GET", `/users/${user.user_id}/records`)((status, records) => {
        if (status !== 200) {
            recordCountLabel.textContent = "Failed to load records.";
            return;
        }

        for (const record of records) {
            record.username = user.username;

            recordList.insertAdjacentHTML("beforeend", `
                <div class="card review-card bg-light-subtle flex-shrink-0 my-2">
                    <div class="card-body overflow-scroll">
                        <div class="card-title">
                            <h5 class="fw-bold text-center mb-1 status"></h5>
                            <small class="text-muted">
                                <span class="challenge"></span> on <span class="date"></span>
                            </small>
                        </div>
                        <p class="notes-label mb-1"></p>
                    </div>
                </div>
            `);
            const card = recordList.lastElementChild;
            const challengeLabel = card.querySelector(".challenge");
            challengeLabel.insertAdjacentHTML("beforeend", `
                <a href="/challenges.html?challenge_id=${record.challenge_id}" class="text-decoration-none">${record.challenge}</a>    
            `);
            card.querySelector(".date").textContent = new Date(record.creation_date).toLocaleDateString();

            loadChallengeRecordCard(card, record, user);
        }
        recordCountLabel.textContent = records.length + " Records";
        loadList(recordList);
    });

    api("GET", `/users/${user.user_id}/characters`)((status, characters) => {
        if (status !== 200) {
            main.querySelector("#character-count-container").textContent = "Failed to load characters.";
            return;
        }
        const characterList = document.querySelector(".character-list");
        for (const character of characters)
            createCharacterCard(characterList, character, user);

        loadCharactersInfo(characters);
    });


    main.classList.remove("text-loading");
}

document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector("main");
    main.classList.add("text-loading");
    const searchedUserId = SEARCH_PARAMS.get("user_id");

    if (searchedUserId) {
        api("GET", `/users/${searchedUserId}`)((status, response) => {
            if (status === 404) {
                window.location.href = "/404.html";
                return;
            }
            if (status !== 200) {
                showErrorToast(status, response);
                return;
            }

            loadProfile(response);
        });

    }
    else {
        getUserWithToken((status, user) => {
            if (status === 401 && searchedUserId == undefined) { // didnt search for a user and isnt logged in
                window.location.href = "/login.html";
                return;
            }

            if (status !== 200) {
                showErrorToast(status, user);
                return;
            }

            loadProfile(user);
        });
    }
});