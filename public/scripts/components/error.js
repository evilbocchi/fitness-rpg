/**
 * Append an error card to an element.
 * 
 * @param {Element} element The element to append the card to.
 * @param {Function} retryCallback The retry callback function. If no callback is provided, the retry button will be hidden.
 * @returns {Element} The error card.
 */
export function createErrorCard(element, retryCallback) {
    element.insertAdjacentHTML("beforeend", `
    <p class="text-danger m-auto">Failed to retrieve data. 
        <button class="retry btn ${retryCallback == undefined ? "d-none" : ""}"><i class="bi bi-arrow-clockwise"></i></button>
    </p>
    `);
    const card = element.lastElementChild;

    if (retryCallback) {
        card.querySelector(".retry").addEventListener("click", () => {
            card.remove();
            retryCallback();
        });
    }
    
    return card;
}