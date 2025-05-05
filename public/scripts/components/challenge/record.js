/**
 * @typedef {{completed: boolean, notes: string, creation_date: string, user_id: number, username: string}} ChallengeRecord
 * @typedef {{user_id: number, username: string}} User
 */

/**
 * Append a challenge record card to an element.
 * 
 * @param {HTMLElement} element The list to append the card to.
 * @param {ChallengeRecord} record The challenge record.
 * @param {User} user The user that is currently logged in.
 * @returns {HTMLElement} The card element.
 */
export function createChallengeRecordCard(element, record, user) {
    const isSameUser = record.user_id == user.user_id;

    element.insertAdjacentHTML(isSameUser ? "afterbegin" : "beforeend", `
    <div id="record-${record.complete_id}" class="card record-card bg-light-subtle flex-shrink-0 my-2">
        <div class="card-body overflow-scroll">
            <h5 class="fw-bold text-center mb-1 status"></h5>
            <figure class="mb-0">
                <blockquote class="notes-label"></blockquote>
                <figcaption class="blockquote-footer mb-0">
                    <a class="text-decoration-none username"></a>, <span class="date"></span>
                </figcaption>
            </figure>
        </div>
    </div>
    `);

    const card = isSameUser ? element.firstElementChild : element.lastElementChild;
    return loadChallengeRecordCard(card, record, user);
}

/**
 * Load a challenge record card with the specified details.
 * 
 * @param {HTMLElement} card The card to load.
 * @param {ChallengeRecord} record The challenge record.
 * @param {User} user The user that is currently logged in.
 * @returns {HTMLElement} The card element.
 */
export function loadChallengeRecordCard(card, record, user) {
    const isCompleted = record.completed;
    const notes = record.notes;
    const isSameUser = record.user_id == user.user_id;
    const formattedDate = record.creation_date.split(" ")[0];
    const isNotesBlank = notes == undefined || notes == "";
    const defaultMessage = isSameUser ? "You have not left any notes." : "No notes were left.";

    const statusLabel = card.querySelector(".status");
    if (statusLabel) {
        statusLabel.textContent = isCompleted ? "Completed" : "Attempted";
        statusLabel.classList.add(isCompleted ? "text-sin-city-red" : "text-vanusa");
    }

    const notesLabel = card.querySelector(".notes-label");
    if (notesLabel) {
        notesLabel.textContent = isNotesBlank ? defaultMessage : `"${notes}"`;
        notesLabel.classList.toggle("text-muted", isNotesBlank);
    }

    const usernameLabel = card.querySelector(".username");
    if (usernameLabel) {
        usernameLabel.textContent = record.username;
        usernameLabel.href = `/profile.html?user_id=${record.user_id}`;
        usernameLabel.classList.add(isSameUser ? "text-danger" : "text-muted");
    }

    card.querySelector(".date").textContent = formattedDate;

    return card;
}

