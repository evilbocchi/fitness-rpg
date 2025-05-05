export function loadList(element) {
    if (element.listLoaded)
        return;

    element.listLoaded = true;
    const parent = element.parentElement;
    parent.classList.add("list-container");
    const leftNav = parent.querySelector(".left-nav");
    const rightNav = parent.querySelector(".right-nav");

    if (leftNav != undefined)
        leftNav.addEventListener("click", () => element.scrollBy(-element.getBoundingClientRect().width * 0.45, 0));

    if (rightNav != undefined)
        rightNav.addEventListener("click", () => element.scrollBy(element.getBoundingClientRect().width * 0.45, 0));
}