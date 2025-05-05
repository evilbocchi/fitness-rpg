import api from "../../queries/query.js";
import { showToast } from "../toast.js";

/**
 * @typedef {{rating: number, description: string, creation_date: string, user_id: number, username: string, challenge_id: number, review_id: number}} ChallengeReview
 * @typedef {{user_id: number, username: string}} User
 */

/**
 * Append a challenge review card to an element.
 * 
 * @param {HTMLElement} element The list to append the card to.
 * @param {ChallengeReview} review The challenge review.
 * @param {User} user The user that is currently logged in.
 */
export function createChallengeReviewCard(element, review, user) {
    const isSameUser = review.user_id == user.user_id;

    element.insertAdjacentHTML(isSameUser ? "afterbegin" : "beforeend", `
        <div class="card review-card bg-light-subtle flex-shrink-0 my-2">
            <div class="card-body overflow-scroll">
                <div class="card-title">
                    <div class="row justify-content-between">
                        <a class="col my-auto me-2 fw-bold h5 text-decoration-none text-muted" href="/profile.html?user_id=${review.user_id}">${review.username}</a>
                        <div class="col-auto rating"></div>
                    </div>
                    <small class="text-muted">${review.creation_date.split(" ")[0]}</small>
                </div>
                <p class="description mb-1">
                    ${review.description}
                    <span>
                        <a class="edit-button text-muted ms-1 d-none" href="#"><i class="bi bi-pencil-square"></i></a>
                        <a class="delete-button text-danger ms-1 d-none" href="#"><i class="bi bi-trash"></i></a>
                    </span> 
                </p>
            </div>
        </div>
    `);

    const card = isSameUser ? element.firstElementChild : element.lastElementChild;
    return loadChallengeReviewCard(card, review, user);
}

/**
 * Load a challenge review card with the specified details.
 * 
 * @param {HTMLElement} card The list to append the card to.
 * @param {ChallengeReview} review The challenge review.
 * @param {User} user The user that is currently logged in.
 */
export function loadChallengeReviewCard(card, review, user) {
    const rating = review.rating;
    const ratingScale = card.querySelector(".rating");
    for (let i = 1; i < 6; i++) {
        const star = document.createElement("i");
        star.className = `bi bi-${rating >= i ? "star-fill" : "star"}`;
        ratingScale.appendChild(star);
    }

    const description = card.querySelector(".description");

    if (review.user_id == user.user_id) {
        const editButton = description.querySelector(".edit-button");
        editButton.classList.remove("d-none");
        editButton.addEventListener("click", (event) => {
            event.preventDefault();
            const reviewModalElement = document.getElementById("review-modal");
            reviewModalElement.querySelector(".rating").children[review.rating - 1].click();
            reviewModalElement.querySelector("#description").value = review.description;
            new bootstrap.Modal(reviewModalElement).show();
        });

        const deleteButton = description.querySelector(".delete-button");
        deleteButton.classList.remove("d-none");
        deleteButton.addEventListener("click", (event) => {
            event.preventDefault();
            if (!confirm("Are you sure you want to delete this review?"))
                return;

            const data = {
                user_id: review.user_id,
                challenge_id: review.challenge_id,
            }
            api("DELETE", `/challenges/${review.challenge_id}/review`, data, true)((status, response) => {
                if (status !== 204) {
                    alert(response.message);
                    return;
                }
                card.remove();
                const challengeItem = document.getElementById(`challenge-${review.challenge_id}`).parentElement;
                challengeItem.reviews = challengeItem.reviews.filter((r) => r.review_id !== review.review_id);
                challengeItem.refreshReviews(200);
                challengeItem.refreshOptions();

                showToast("review-deleted", "Review Deleted", "Your review has been successfully deleted.");
            });
        });
    }

    return card;
}

