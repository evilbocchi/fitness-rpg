import { getChallengeRecords, getUserWithToken, USER_OBSERVER } from "../../queries/cache.js";
import api, { ACCESS_TOKEN, asyncApi } from "../../queries/query.js";
import { createErrorCard } from "../error.js";
import { loadForm } from "../form.js";
import { loadList } from "../list.js";
import { showToast } from "../toast.js";
import { createChallengeRecordCard } from "./record.js";
import { createChallengeReviewCard } from "./review.js";

const searchParams = new URLSearchParams(window.location.search);

/**
 * @typedef {import ("bootstrap").Modal} Modal
 * @typedef {{challenge_id: number, title: string, skillpoints: number, rating: number, reviews: number, attempts: number, creation_date: string}} Challenge
 */

/**
 * Challenge completion modal that appears after completing or aborting a challenge. Initialized after DOM is loaded.
 * @type {Modal}
 */
let completionModal;

/**
 * Challenge review modal that appears after reviewing a challenge. Initialized after DOM is loaded.
 * @type {Modal}
 */
let reviewModal;

/**
 * Modal to setup a challenge. Initialized after DOM is loaded.
 * @type {Modal}
 */
let setupModal;

/**
 * The challenge that is currently being edited.
 */
let editingChallengeId = 0;

/**
 * Retrieve the challenge accordion from the DOM.
 */
export function getChallengeAccordion() {
    return document.getElementById("challenge-accordion");
}

/**
 * Refresh a challenge card.
 * 
 * @param {Element} item The challenge card.
 * @param {Challenge} challenge The challenge.
 */
export function refreshChallengeItem(item, challenge) {
    const titleLabel = item.querySelector(".title");
    titleLabel.textContent = challenge.title;

    const skillpointsLabel = item.querySelector(".skillpoints");
    skillpointsLabel.textContent = challenge.skillpoints;
}

/**
 * Append a challenge card to an element.
 * 
 * @param {Element} element The challenge list to append the card to.
 * @param {Challenge} challenge The challenge.
 */
export function createChallengeItem(element, challenge, user) {
    challenge.title ??= challenge.challenge;
    challenge.rating ??= 0;
    challenge.reviews ??= 0;
    element.insertAdjacentHTML("beforeend", `
    <div class="accordion-item">
        <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#challenge-${challenge.challenge_id}">
                <span class="title"></span>
                <span class="badge rounded-pill text-bg-light ms-2 me-2">
                    <span class="text-skillpoint">+<span class="skillpoints"></span></span><i class="bi bi-brilliance ps-1 text-skillpoint"></i>
                </span>
            </button>
        </h2>
        <div id="challenge-${challenge.challenge_id}" class="accordion-collapse collapse" data-bs-parent="#challenge-accordion">
            <div class="accordion-body">
                <p>Creator: <a class="text-decoration-none" href="/profile.html?user_id=${challenge.creator_id}">${challenge.username}</a></p>
                <p>Creation Date: ${challenge.creation_date}</p>
                <hr>
                <h4 class="fw-bold">Reviews</h4>
                <div class="container">
                    <div class="d-flex align-items-center">
                        <h5 class="mb-0 me-2 average-rating">${Number.parseFloat(challenge.rating).toFixed(1)}</h5>
                        <div class="rating"></div>
                        <p class="ms-2 mb-0">(<span class="review-count">${challenge.reviews}</span> reviews)</p>
                    </div>

                    <div class="mt-3 row justify-content-center align-items-stretch">
                        <button class="col-auto btn btn-light left-nav">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <div class="col review-list"></div>
                        <button class="col-auto btn btn-light right-nav">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <hr>
                <h4 class="fw-bold mb-0">Records</h4>
                <p class="attemptCount lead"></p>
                <div class="container">
                    <div class="mt-3 row justify-content-center align-items-stretch">
                        <button class="col-auto btn btn-light left-nav">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <div class="col record-list"></div>
                        <button class="col-auto btn btn-light right-nav">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <hr>
                <p class="text-muted small userAttemptCount"></p>
                <div class="options d-flex align-items-end"></div>
            </div>
        </div>
    </div>
    `);

    const item = element.lastElementChild;
    refreshChallengeItem(item, challenge);

    const accordionButton = item.querySelector(".accordion-button");
    const ratingScale = item.querySelector(".rating");

    // loading advanced challenge details like reviews and records is costly, so it only happens when the user inspects a challenge
    const refreshRecords = (status) => {
        const records = item.records;
        const list = item.querySelector(".record-list");
        const attemptsLabel = item.querySelector(".attemptCount");

        if (status === 404) {
            list.parentElement.classList.add("d-none");
            attemptsLabel.textContent = `0 Attempts... Be the first to try this challenge!`;
            return;
        }

        if (status !== 200) {
            list.parentElement.classList.add("d-none");
            attemptsLabel.textContent = "Failed to retrieve records.";
            return;
        }

        list.parentElement.classList.remove("d-none");

        let userAttemptCount = 0;
        loadList(list);
        for (const record of records) {
            if (list.querySelector(`#record-${record.complete_id}`) != undefined)
                continue;

            createChallengeRecordCard(list, record, user);
            if (record.user_id === user.user_id)
                userAttemptCount++;
        }

        attemptsLabel.textContent = `${records.length} Attempts`;
        item.querySelector(".userAttemptCount").textContent = `You have attempted this challenge ${userAttemptCount} ${userAttemptCount === 1 ? "time" : "times"}.`;
    }

    const refreshReviews = (status) => {
        const list = item.querySelector(".review-list");
        list.replaceChildren();
        const reviews = item.reviews;
        const reviewCount = status === 200 ? reviews.length : 0;
        let totalRating = 0;
        let hasReview = false;

        if (reviewCount === 0) {
            list.parentElement.classList.add("d-none");
        }
        else {
            list.parentElement.classList.remove("d-none");

            loadList(list);
            for (const review of item.reviews) {
                if (review.user_id === user.user_id) {
                    hasReview = true;
                }
                createChallengeReviewCard(list, review, user);
                totalRating += review.rating;
            }
        }

        const averageRating = reviewCount === 0 ? 0 : totalRating / reviewCount;
        item.querySelector(".average-rating").textContent = averageRating.toFixed(1);
        item.querySelector(".review-count").textContent = reviewCount;
        const children = [];
        for (let i = 1; i < 6; i++) {
            const star = document.createElement("i");
            star.className = `bi bi-${averageRating >= i ? "star-fill" : (averageRating >= i - 0.5 ? "star-half" : "star")}`;
            children.push(star);
        }
        ratingScale.replaceChildren(...children);
    }

    const load = async () => {
        const [status, reviews] = await asyncApi("GET", `/challenges/${challenge.challenge_id}/review`);

        item.reviews = status === 200 ? reviews : [];
        refreshReviews(status);

        getChallengeRecords(challenge.challenge_id)((recordsStatus, records) => {
            item.records = recordsStatus === 200 ? records : [];
            refreshRecords(recordsStatus);
            refreshOptions();
        });

        accordionButton.removeEventListener("click", load);
    }

    accordionButton.addEventListener("click", load);
    accordionButton.addEventListener("click", () => {
        searchParams.set("challenge_id", challenge.challenge_id);
        history.pushState(null, null, "?" + searchParams.toString());
    });

    const options = item.querySelector(".options");
    const key = "ongoing_" + user.user_id + "_" + challenge.challenge_id;

    const createOption = (clickCallback) => {
        const button = document.createElement("button");
        button.classList.add("btn", "emphasised");
        options.appendChild(button);
        if (clickCallback)
            button.addEventListener("click", () => {
                if (ACCESS_TOKEN == undefined) {
                    window.location.href = "/register.html";
                    return;
                }
                clickCallback();
            });
        return button;
    }

    const refreshOptions = () => {
        options.replaceChildren();

        const reviewButton = createOption(() => reviewModal.show());
        reviewButton.classList.add("btn-secondary", "me-2", "review-button");
        if (item.reviews.some(review => review.user_id === user.user_id) || !item.records.some(record => record.user_id === user.user_id))
            reviewButton.classList.add("d-none");

        reviewButton.textContent = "Review";

        if (localStorage.getItem(key) === "true") {
            /** @type {HTMLInputElement} */
            const completionInput = document.getElementById("completion");

            const completeButton = createOption(() => {
                completionInput.checked = true;
                completionModal.show();
            });
            completeButton.classList.add("btn-primary");
            completeButton.textContent = "Finish";

            const abortButton = createOption(() => {
                completionInput.checked = false;
                completionModal.show();
            });
            abortButton.classList.add("btn-danger", "ms-2");
            abortButton.textContent = "Abort";
        }
        else {
            const startButton = createOption(() => {
                if (ACCESS_TOKEN == undefined) {
                    window.location.href = "/register.html";
                    return;
                }

                localStorage.setItem(key, "true");
                showToast("challenge-start-toast", "Challenge Started", `You have started the challenge: ${challenge.title}. Good luck!`);
                refreshOptions();
            });
            startButton.classList.add("btn-success");
            startButton.textContent = "Start";
        }

        if (user.user_id === challenge.creator_id) {
            const separator = document.createElement("div");
            separator.classList.add("flex-grow-1");
            options.appendChild(separator);

            const editButton = createOption(() => {
                editingChallengeId = challenge.challenge_id;
                const form = document.getElementById("challenge-setup-form");
                form.querySelector("#challenge").value = item.querySelector(".title").textContent;
                form.querySelector("#skillpoints").value = item.querySelector(".skillpoints").textContent;
                setupModal.show();
            });
            editButton.classList.add("btn-info", "text-white", "ms-2", "py-1", "px-2");
            editButton.insertAdjacentHTML("afterbegin", `<i class="bi bi-pencil"></i>`);

            const deleteButton = createOption(() => {
                if (!confirm("Are you sure you want to delete this challenge?"))
                    return;

                api("DELETE", `/challenges/${challenge.challenge_id}`, null, true)((status, response) => {
                    if (status !== 204) {
                        alert(response.message);
                        return;
                    }
                    item.remove();
                });
            });
            deleteButton.classList.add("btn-danger", "ms-2", "py-1", "px-2");
            deleteButton.insertAdjacentHTML("afterbegin", `<i class="bi bi-trash"></i>`);
        }
    }
    item.refreshOptions = refreshOptions;
    item.refreshRecords = refreshRecords;
    item.refreshReviews = refreshReviews;

    if (challenge.challenge_id == searchParams.get("challenge_id")) {
        load();
        item.querySelector(".accordion-collapse").classList.add("show");
        accordionButton.classList.remove("collapsed");
        item.scrollIntoView();
    }

    return item;
}

/**
 * Load challenges into a challenge list.
 */
export function loadChallengeAccordion(user) {
    const element = getChallengeAccordion();
    api("GET", "/challenges/")((status, challenges) => {
        if (status !== 200)
            return createErrorCard(element, () => loadChallengeAccordion(user));

        for (const challenge of challenges) {
            createChallengeItem(element, challenge, user);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    completionModal = new bootstrap.Modal('#completion-modal');

    // load rating scale for review modal
    const reviewModalElement = document.getElementById("review-modal");
    reviewModal = new bootstrap.Modal(reviewModalElement);
    const ratingScale = reviewModalElement.querySelector(".rating");
    const ratingInput = reviewModalElement.querySelector("#rating");
    let currentRating = 0;
    for (let i = 1; i < 6; i++) {
        const star = document.createElement("i");
        ratingScale.appendChild(star);

        star.addEventListener("mouseover", () => {
            updateRating(i, true);
        });
        star.addEventListener("mouseout", () => {
            updateRating(currentRating, false);
        });
        star.addEventListener("click", () => {
            currentRating = i;
            ratingInput.value = i;
            updateRating(i, false);
        });
    }
    const updateRating = (rating, isTransparent) => {
        const stars = ratingScale.children;
        for (let i = 0; i < 5; i++) {
            const star = stars[i];
            const withinSelection = rating >= i + 1;

            star.className = `bi bi-${withinSelection ? "star-fill" : "star"} me-1`;
            star.style.opacity = withinSelection || !isTransparent ? 1 : 0.5;
        }
    }
    updateRating(currentRating, false);

    setupModal = new bootstrap.Modal('#setup-modal');
    document.getElementById("create-challenge").addEventListener("click", () => {
        if (ACCESS_TOKEN == undefined) {
            window.location.href = "/register.html";
            return;
        }
        editingChallengeId = 0;
        setupModal.show();
    });


    getUserWithToken((status, user) => {
        loadChallengeAccordion(user);

        loadForm(document.getElementById("challenge-completion-form"), (data, showError) => {
            data.creation_date = new Date().toISOString().split("T")[0];
            data.completed = data.completion == "on" ? true : false;
            if (data.notes == "")
                delete data.notes;

            const challenge_id = searchParams.get("challenge_id");
            const key = "ongoing_" + user.user_id + "_" + challenge_id;

            if (localStorage.getItem(key) !== "true")
                return;

            api("POST", `/challenges/${challenge_id}`, data, true)((status, response) => {
                if (status !== 201) {
                    showError(response.message);
                    return;
                }

                completionModal.hide();
                localStorage.removeItem(key);

                const item = document.getElementById(`challenge-${challenge_id}`).parentElement;
                item.records.push(response);
                item.refreshRecords(200);
                item.refreshOptions();

                showToast("challenge-complete-toast", "Challenge Completed", `You have ${data.completed ? "completed" : "aborted"} the challenge.`);
                USER_OBSERVER.update();
            });
        });

        loadForm(document.getElementById("challenge-review-form"), (data, showError) => {
            if (data.rating == 0 || data.rating == undefined) {
                showError("Please select a rating.");
                return;
            }

            const challenge_id = Number.parseInt(searchParams.get("challenge_id"));
            data.challenge_id = challenge_id;
            data.user_id = user.user_id;

            if (data.description == "") {
                showError("Please explain your rating.");
                return;
            }
            const item = document.getElementById(`challenge-${challenge_id}`).parentElement;
            const hasReviewed = item.reviews.some(review => review.user_id === user.user_id);

            api(hasReviewed ? "PUT" : "POST", `/challenges/${searchParams.get("challenge_id")}/review`, data, true)((status, response) => {
                if (status !== 201 && status !== 204) {
                    showError(response.message);
                    return;
                }

                reviewModal.hide();
                if (status === 201) {
                    item.reviews.push(response);
                    item.refreshReviews(200);
                    item.refreshOptions();
                    showToast("challenge-review-toast", "Review Submitted", "Thank you for your review!");
                }
                else {
                    window.location.reload(); // 204 response, so just refresh the page
                }
            });
        });

        loadForm(document.getElementById("challenge-setup-form"), (data, showError) => {
            if (data.skillpoints == "")
                data.skillpoints = 0;

            let call;
            if (editingChallengeId !== 0)
                call = api("PUT", `/challenges/${editingChallengeId}`, data, true);
            else
                call = api("POST", "/challenges", data, true);


            call((status, response) => {
                if (status !== 201 && status !== 200) {
                    showError(response.message);
                    return;
                }

                setupModal.hide();
                if (editingChallengeId !== 0) {
                    const item = document.getElementById(`challenge-${editingChallengeId}`).parentElement;
                    response.title ??= response.challenge;
                    refreshChallengeItem(item, response);

                    showToast("challenge-edit-toast", "Challenge Updated", "Your challenge has been updated.");
                    return;
                }

                const item = createChallengeItem(getChallengeAccordion(), response, user);
                item.scrollIntoView();
                item.querySelector(".accordion-button").click();
            });
        });

    });

});