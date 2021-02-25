"use strict";

import makeTreeProofParagraph from "./MakeTreeProofParagraph.js";

export default function measureWidthInProof(str) {
    let para = makeTreeProofParagraph(str);
    para.style.color = "white";
    document.body.appendChild(para);
    let width = para.clientWidth;
    document.body.removeChild(para);
    return width;
}