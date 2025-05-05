import { getUserWithToken } from "../queries/cache.js";
import { ACCESS_TOKEN } from "../queries/query.js";
import { showErrorToast } from "./toast.js";

export function loadNavbar() {
    const navbar = getNavbar();
    navbar.insertAdjacentHTML("afterbegin", `
    <div class="container-fluid">
        <a class="navbar-brand" href="/index.html">
            <img src="assets/mini-logo.png" alt="Fitness Quest" width="50">
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link" href="/index.html">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/profile.html">Profile</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/challenges.html">Challenges</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/characters.html">Characters</a>
                </li>
                <li class="nav-item skillpoints-container">
                    <div class="mx-2 d-flex justify-content-center align-items-center rounded-pill bg-body-secondary">
                        <span class="nav-link text-skillpoint fw-bold">
                            <span class="ms-2 skillpoints">0</span><i class="bi bi-brilliance px-2"></i>
                        </span>
                    </div>
                </li>
            </ul>
            <ul class="unauthed navbar-nav ms-auto mb-2 mb-lg-0 gap-2">
                <li class="nav-item">
                    <a class="btn btn-primary emphasised" href="/register.html">Sign Up</a>
                </li>
                <li class="nav-item">
                    <a class="btn btn-secondary emphasised" href="/login.html">Login</a>
                </li>
            </ul>
            <ul class="authed navbar-nav ms-auto mb-2 mb-lg-0">
                <li class="nav-item dropstart">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <!-- empty pfp from https://www.needpix.com/photo/467175/blank-profile-picture-mystery-man-avatar-display-pic-profile-man-person-profile-icon-portrait -->
                        <img class="rounded-circle pfp" src="/assets/blank-pfp.png" alt="User" width="40" height="40">
                        <span class="username ms-2">Username</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="https://gravatar.com/profile" target="_blank">Change Profile Icon</a></li>
                        <li><a class="dropdown-item logout" href="">Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
    `);

    const hasToken = ACCESS_TOKEN != undefined;
    const toHide = hasToken ? "unauthed" : "authed";
    for (const option of document.getElementsByClassName(toHide))
        option.remove();

    getUserWithToken((status, user) => {
        if (status === 401)
            return;
        
        if (status !== 200)
            return showErrorToast(status, user);

        const username = navbar.querySelector(".username");
        username.textContent = user.username;

        const pfp = navbar.querySelector(".pfp");
        pfp.src = `https://www.gravatar.com/avatar/${CryptoJS.SHA256(user.email)}`;

        const skillpoints = navbar.querySelector(".skillpoints");
        skillpoints.textContent = user.skillpoints;
    }, true);

    if (hasToken) {
        const logout = document.querySelector(".logout");
        logout.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("accessToken");
            window.location.reload();
        });
    }
    else {
        navbar.querySelector(".skillpoints-container").remove();
    }

    navbar.classList.add("navbar-expand-lg", "bg-body-tertiary", "border-bottom", "border-dark", "z-2", "fixed-top");
}

/**
 * Retrieve the navbar from the DOM.
 */
export function getNavbar() {
    return document.getElementsByClassName("navbar")[0];
}

/**
 * Refreshes the navbar margin to match the height of the navbar.
 */
export function setNavbarMargin() {
    const navbar = getNavbar();

    const navbarMargin = document.getElementById("navbar-margin");
    let height = 0;
    if (navbarMargin != undefined) {
        navbarMargin.style.width = "100%";
        height = navbar.getBoundingClientRect().height;
        navbarMargin.style.height = height + "px";
    }
    return height;
}

// the navbar margin is set on page load
document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();

    const observer = new ResizeObserver(setNavbarMargin);
    observer.observe(getNavbar());
});