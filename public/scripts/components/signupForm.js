import api, { ACCESS_TOKEN } from "../queries/query.js";
import { loadForm } from "./form.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    if (ACCESS_TOKEN != undefined) {
        window.location.href = "/index.html";
        return;
    }

    loadForm(form, (data, showError) => {
        if (data.password !== data['confirm-password'])
            return showError("Passwords do not match.");

        api("POST", "/users", data, true)((status, response) => {
            if (response.token != undefined) {
                localStorage.setItem("accessToken", response.token);
                window.location.href = "/index.html";
                return;
            }

            showError(response.message);
        });
    });
});