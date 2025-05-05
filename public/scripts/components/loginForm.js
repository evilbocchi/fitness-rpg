import api, { ACCESS_TOKEN } from "../queries/query.js";
import { loadForm } from "./form.js";


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    if (ACCESS_TOKEN != undefined) {
        window.location.href = "/index.html";
        return;
    }

    loadForm(form, (data, showError) => {
        data.rememberme = data.rememberme == "on" ? true : false;
        api("POST", "/users/login", data)((status, response) => {
            if (status !== 200) {
                return showError(response.message);
            }

            localStorage.setItem("accessToken", response.token);
            window.location.href = document.referrer;
        });
    });
});