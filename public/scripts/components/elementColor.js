/**
 * @typedef {"Fire" | "Water" | "Earth" | "Air" | "Light" | "Darkness"} NatureElement
 */

export const ELEMENT_CLASSES = {
    "fire": "kyoto",
    "water": "clear-sky",
    "earth": "love-and-liberty",
    "air": "steel-gray",
    "light": "azure-pop",
    "darkness": "celestial"
}

/**
 * Helper function to set text color with a corresponding nature element.
 * 
 * @param {HTMLElement} text Text element to set the color for.
 * @param {NatureElement} element String representing the nature element.
 */
export function setTextColorForElement(text, element) {
    text.classList.add(getTextClassForElement(element));
}

/**
 * Retrieve the text color class for the specified nature element.
 * 
 * @param {NatureElement} element String representing the nature element.
 * @returns The class name for the text color.
 */
export function getTextClassForElement(element) {
    if (element == undefined)
        return "";

    element = element.toLowerCase();
    const elementClass = ELEMENT_CLASSES[element];
    if (elementClass == undefined)
        return "text-muted";

    return "text-" + elementClass;
}