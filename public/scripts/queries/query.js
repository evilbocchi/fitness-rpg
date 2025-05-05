export const currentUrl = window.location.protocol + "//" + window.location.host;

export const ACCESS_TOKEN = localStorage.getItem("accessToken");

/**
 * @typedef {"GET" | "POST" | "PUT" | "PATCH" | "DELETE"} HttpMethod
 * @typedef {(status: number, data: any) => void} ApiCallback
 * @typedef {(callback: ApiCallback) => void} ApiCallbackFactory
 */

/**
 * Calls the API.
 * 
 * @param {HttpMethod} method HTTP method to use. 
 * @param {string} path Path to the API endpoint. Is relative to the API root URL. If the path starts with "http", it is treated as an absolute URL.
 * @param {any} data The request body.
 * @param {boolean?} enableToken Whether to include the access token.
 * @param {boolean?} enableCookies Whether to include cookies.
 * @returns {ApiCallbackFactory} The callback function, where data is the response body.
 */
export default function api(method, path, data = null, enableToken = false, enableCookies = false) {
    return (callback) => {
        let url;

        if (path.substring(0, 4) === "http") {
            url = path;
        }
        else {
            if (path.substring(0, 1) === "/")
                path = path.substring(1);
            url = currentUrl + "/api/" + path;
        }

        const headers = {};

        if (data)
            headers["Content-Type"] = "application/json";

        if (enableToken)
            headers["Authorization"] = "Bearer " + ACCESS_TOKEN;

        const options = {
            method: method.toUpperCase(),
            headers: headers,
        };

        if (enableCookies)
            options.credentials = "include";

        if (data !== null) {
            options.body = JSON.stringify(data);
        }

        fetch(url, options)
            .then((response) => {
                if (response.status == 204) {
                    callback(response.status, {});
                } else {
                    response.json().then((responseData) => callback(response.status, responseData));
                }
            })
            .catch((error) => console.error(`Error from ${method} ${url}:`, error));
    }
}

/**
 * Calls the API and returns a promise.
 * 
 * @param {HttpMethod} method HTTP method to use. 
 * @param {string} path Path to the API endpoint. Is relative to the API root URL. If the path starts with "http", it is treated as an absolute URL.
 * @param {any} data The request body.
 * @param {boolean?} enableToken Whether to include the access token.
 * @param {boolean?} enableCookies Whether to include cookies.
 * @returns {Promise<[number, any]>} A promise that resolves with the status code and the response body.
 */
export async function asyncApi(method, path, data = null, enableToken = false, enableCookies = false) {
    return new Promise((resolve) => {
        api(method, path, data, enableToken, enableCookies)((status, data) => resolve([status, data]));
    });
}