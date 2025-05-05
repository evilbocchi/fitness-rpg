import { getUserWithToken } from "../queries/cache.js";
import { ACCESS_TOKEN } from "../queries/query.js";
import { showErrorToast } from "./toast.js";

document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector("#hero");
    const title = hero.querySelector("#hero-title");
    const logo = hero.querySelector("#hero-logo");

    if (ACCESS_TOKEN != undefined) {
        for (const authOptions of hero.getElementsByClassName("auth-options")) {
            authOptions.remove();
        }
        logo.remove();
        hero.classList.add("px-5");
        const container = title.parentElement;

        title.classList.add("text-loading");
        title.classList.remove("display-4", "drop-shadow");

        const hr = document.createElement("hr");
        hr.classList.add("mt-4", "mb-3");

        const subtitle = document.createElement("h2");
        subtitle.classList.add("lead", "text-muted");
        subtitle.textContent = "What will you challenge yourself with today?";

        const skillpointsLabel = document.createElement("p");
        skillpointsLabel.classList.add("lead");

        container.appendChild(hr);
        container.appendChild(subtitle);
        container.appendChild(skillpointsLabel);

        getUserWithToken((status, response) => {
            if (status === 401)
                return;
            
            if (status !== 200) {
                showErrorToast(status, response);
                return;
            }

            title.innerHTML = `Welcome back, <span class="text-alive">${response.username}</span>!`;
            title.classList.remove("text-loading");
            skillpointsLabel.innerHTML = `
            Skillpoints: <span class="text-skillpoint">
                <span class="ms-2">${response.skillpoints}</span><i class="bi bi-brilliance px-2"></i>
            </span>
            `;
        });
    }
});