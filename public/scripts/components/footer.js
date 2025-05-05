export function loadFooter() {
    const footer = getFooter();
    footer.insertAdjacentHTML("beforeend", `
    <div class="container d-flex flex-wrap justify-content-between align-items-center mt-auto py-3">
        <p class="col-md-4 mb-0 text-body-secondary">© 2024 Fitness Quest Inc.</p>

        <a href="/index.html" class="col-md-4 d-flex align-items-center justify-content-center me-md-auto">
            <img src="/assets/mini-logo.png" width="40" height="40">
        </a>

        <ul class="nav col-md-4 justify-content-end">
        <li class="nav-item"><a href="/privacypolicy.html" class="nav-link px-2 text-muted">Privacy Policy</a></li>
        </ul>
    </div>
    `);

    footer.classList.add("bg-body-tertiary", "border-top", "border-dark");
}

/**
 * Retrieve the footer from the DOM.
 */
export function getFooter() {
    return document.getElementById("footer");
}

// the navbar margin is set on page load
document.addEventListener("DOMContentLoaded", () => {
    loadFooter();
});