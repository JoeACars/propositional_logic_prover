"use strict";

export default function makeProofParagraph(str, offsetLeft = 0, offsetTop = 0) {
    let para = document.createElement("p");
    para.style.whiteSpace = "pre";
    para.style.position = "absolute";
    para.style.left = String(offsetLeft) + "px";
    para.style.top = String(offsetTop) + "px";
    para.innerHTML = str;
    return para;
}