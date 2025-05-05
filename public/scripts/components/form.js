/**
 * Provides utilities for working with forms.
 * 
 * @param {HTMLFormElement} form The form to load.
 * @param {(data: any, showError: (message: string) => void) => void} callback Called when the form is submitted.
 */
export function loadForm(form, callback) {
    const showError = (message) => {
        const errorCard = form.querySelector(".error");
        if (message == undefined) {
            errorCard.classList.add("d-none");
            return;
        }
        errorCard.classList.remove("d-none");
        errorCard.textContent = message;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        showError();
        
        callback(data, showError);
    });
}