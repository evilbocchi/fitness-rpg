import api from "../../queries/query.js";
import { createErrorCard } from "../error.js";
import { loadList } from "../list.js";
import clamp from "../../libraries/clamp.js";

/**
 * Retrieve all challenge lists from the DOM.
 */
export function getChallengeLists() {
    return document.getElementsByClassName("challenge-list");
}

/**
 * Append a challenge card to an element.
 * 
 * @param {Element} element The list to append the card to.
 * @param {{challenge_id: number, title: string, skillpoints: number, rating: number, reviews: number, attempts: number}} challenge The challenge.
 */
export function createChallengeCard(element, challenge) {
    challenge.title ??= challenge.challenge;
    let rating = Number.parseFloat(challenge.rating);
    if (Number.isNaN(rating))
        rating = 0;
    challenge.reviews ??= 0;

    element.insertAdjacentHTML("beforeend", `
    <a class="btn card card-alive bg-light-subtle challenge-card flex-shrink-0 my-2" href="/challenges.html?challenge_id=${challenge.challenge_id}">
        <div class="card-body d-flex flex-column">
            <h5 class="card-title fw-bold text-danger">${challenge.title}</h5>
            <p class="card-text">Completion: <span class="text-skillpoint">
                <span class="ms-2">+${challenge.skillpoints}</span>&nbsp;<i class="bi bi-brilliance pe-1"></i></span>
            </p>

            <!-- make sure content stays at bottom -->
            <div class="flex-grow-1"></div>
            
            <div class="d-flex justify-content-between align-items-center gap-1">
                <div class="bg-success bg-gradient text-light px-2 rounded">
                    <i class="bi bi-star-fill"></i>
                    <span>${rating.toFixed(1)} (${challenge.reviews})</span>
                </div>
                <div class="bg-danger bg-gradient text-light px-2 rounded">
                    <i class="bi bi-person-check-fill"></i>
                    <span class="completion-count">${challenge.attempts}</span>
                </div>
            </div>
        </div>
    </a>
    `);

    const card = element.lastElementChild;
    clamp(card.querySelector(".card-title"), 3);
}

/**
 * Load challenges into a challenge list.
 * 
 * @param {Element} element The list to load challenges into. 
 */
export function loadChallengeList(element) {
    const classList = element.classList;
    let path;
    if (classList.contains("popular")) {
        path = "/challenges/popular";
    }
    else if (classList.contains("newest")) {
        path = "/challenges/recent";   
    }
    else if (classList.contains("top-rated")) {
        path = "/challenges/toprated";

    }

    api("GET", path)((status, challenges) => {
        if (status !== 200)
            return createErrorCard(element, () => loadChallengeList(element));

        for (const challenge of challenges) {
            createChallengeCard(element, challenge);
        }
    });

    loadList(element);
}

document.addEventListener("DOMContentLoaded", () => {
    const challengeLists = getChallengeLists();
    for (const challengeList of challengeLists) {
        loadChallengeList(challengeList);
    }
});
