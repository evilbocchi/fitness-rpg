import STATUS_NAMES from "../libraries/statusNames.js";

/**
 * Shows a toast with the given title and content.
 * 
 * @param {string} id Unique identifier for the toast. If a toast with the same id already exists, it will be updated.
 * @param {string} title Title of the toast.
 * @param {string} content Content of the toast.
 */
export function showToast(id, title, content) {
    const container = document.getElementById("toast-container");
    let toastElement = document.getElementById(id);
    if (toastElement == undefined) {
        container.insertAdjacentHTML("beforeend", `
        <div id="${id}" class="toast my-1" role="alert">
            <div class="toast-header">
                <img src="assets/dumbbell.png" class="rounded me-2" alt="Dumbbell" width="20">
                <strong class="toast-title me-auto"></strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body text-black"></div>
        </div>
        `);
        toastElement = container.lastElementChild;
    }

    const toastTitle = toastElement.querySelector(".toast-title");
    const toastBody = toastElement.querySelector(".toast-body");
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement);
    toastTitle.textContent = title;
    toastBody.textContent = "";
    toastBody.insertAdjacentHTML("afterbegin", content);
    toast.show();
}

/**
 * Shows a toast with the error message from the response.
 * 
 * @param {number} status Status code from an API.
 * @param {{message: string}} response Response body from an API.
 */
export function showErrorToast(status, response) {
    return showToast("error-toast", STATUS_NAMES[status], response.message);
}

