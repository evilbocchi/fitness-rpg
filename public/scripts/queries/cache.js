import api, { ACCESS_TOKEN } from "./query.js";

/**
 * @typedef {import("./query.js").ApiCallback} ApiCallback
 * @typedef {{
 * call: (callback: ApiCallback) => (() => void), 
 * update: () => void, 
 * fire: ApiCallback
 * }} Observer
 */

/**
 * Retrieves data from the API and caches it.
 * Returns a factory function that retrieves the data from the cache and calls the callback with it.
 * 
 * @param {string} path Path to the API endpoint. Is relative to the API root URL. If the path starts with "http", it is treated as an absolute URL.
 * @param {any} data The request body.
 * @param {boolean?} enableToken Whether to include the access token.
 * @param {boolean?} enableCookies Whether to include cookies.
 * @returns {Observer} A function that retrieves the data from the cache and calls the callback with it.
 */
export function createObserver(path, data = null, enableToken = false, enableCookies = false) {
    const OBSERVERS = new Set();

    let cachedStatus;
    let cachedData;

    const update = () => api("GET", path, data, enableToken, enableCookies)((status, data) => {
        cachedStatus = status;
        cachedData = data;

        for (const observer of OBSERVERS)
            observer(status, data);
    });
    update();

    return {
        call: (callback) => {
            if (cachedStatus != undefined)
                callback(cachedStatus, cachedData);
            else
                OBSERVERS.add(callback);
            return () => OBSERVERS.delete(callback);
        },
        update: update,
        fire: (replacedStatus, replacedData) => {
            for (const observer of OBSERVERS)
                observer(replacedStatus ?? cachedStatus, replacedData ?? cachedData);
        }
    };
}

export const SEARCH_PARAMS = new URLSearchParams(window.location.search);

export const enforceCharacterId = () => {
    const character_id = SEARCH_PARAMS.get("character_id");
    if (character_id == undefined)
        window.location.href = "/characters.html";

    return character_id;
}

export const USER_OBSERVER = createObserver("/users/token", null, true);

/**
 * Retrieves the logged in user from the API and caches it.
 * If the token is invalid, the user is logged out.
 * 
 * @param {ApiCallback} callback The callback to call with the user data.
 * @param {boolean} observe Whether to observe the user data. Defaults to false.
 */
export const getUserWithToken = (callback, observe = false) => {
    const disconnect = USER_OBSERVER.call((status, user) => {
        if (status === 401 && ACCESS_TOKEN != undefined) {
            // check if a refresh token exists
            api("POST", "/users/refresh-token", null, null, true)((status, data) => {
                if (status === 200) {
                    localStorage.setItem("accessToken", data.token);
                }
                else {
                    localStorage.removeItem("accessToken");
                }
                window.location.reload();
            });

            return;
        }

        callback(status, user);
        if (observe === false)
            disconnect();
    });
};

const recordMap = new Map();
/**
 * Retrieves the records of the specified challenge from the API and caches it.
 * 
 * @param {number} challenge_id The challenge ID.
 */
export const getChallengeRecords = (challenge_id) => {
    let retriever = recordMap.get(challenge_id);
    if (retriever == undefined) {
        retriever = createObserver(`/challenges/${challenge_id}`).call;
        recordMap.set(challenge_id, retriever);
    }
    return retriever;
};