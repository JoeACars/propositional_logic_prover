let paddingBetweenBranches = 128;
let lineHeight = 22;
let paddingUnderSplit = 64;
let lineVerticalPaddingBefore = 16;
let lineVerticalPaddingAfter = -10;

function makeProofParagraph(str, offsetLeft = 0, offsetTop = 0) {
    let para = document.createElement("p");
    para.style.whiteSpace = "pre";
    para.style.position = "absolute";
    para.style.left = String(offsetLeft) + "px";
    para.style.top = String(offsetTop) + "px";
    para.innerHTML = str;
    return para;
}

function spaceWidthInProof() {
    if (!this._value) {
        this._value = measureWidthInProof(" ");
    }
    return this._value;
}

function displayValidityResult(offsetLeft, offsetTop) {
    let validityResult = document.getElementById(validityResultId);
    validityResult.style.position = "absolute";
    let validityStr;
    if (Proof.isValid()) {
        validityStr = "<span style=\"color: green\">VALID</span>";
    }
    else {
        validityStr = "<span style=\"color: red\">INVALID</span>";
    }
    validityResult.style.left = String(offsetLeft + ((Proof.getDisplayWidth() - measureWidthInProof(validityStr)) / 2)) + "px";
    validityResult.style.top = String(offsetTop) + "px";
    validityResult.innerHTML = validityStr;
}

function clearProof() {
    Proof.clear();
    let proof = document.getElementById(proofListId);
    while (proof.children.length > 0) {
        proof.removeChild(proof.children[0]);
    }
}

function padProof() {
    let proofElems = document.getElementById(proofListId).childNodes.values();
    let maxOffsetTop = 0;
    let maxOffsetLeft = 0;
    function getOffsetAsNumber(str) {
        return Number(str.slice(0, str.length - 2));
    }
    for (let elem of proofElems) {
        maxOffsetTop = Math.max(maxOffsetTop, getOffsetAsNumber(elem.style.top));
        maxOffsetLeft = Math.max(maxOffsetLeft, getOffsetAsNumber(elem.style.left) + elem.clientWidth);
    }
    let pad = document.createElement("p");
    pad.style.whiteSpace = "pre";
    pad.innerHTML = " ";
    pad.style.position = "absolute";
    pad.style.top = String(maxOffsetTop + 2 * lineHeight) + "px";
    pad.style.left = String(maxOffsetLeft + lineHeight) + "px";
    document.getElementById(proofListId).appendChild(pad);
}

function drawLineInProof(startX, startY, endX, endY) {

    // Always go left-to-right
    if (startX > endX) {
        [startX, endX] = [endX, startX];
        [startY, endY] = [endY, startY];
    }
    let isTopToBottom = startY <= endY;

    if (!this._count) {
        this._count = 1;
    }

    let canvas = document.createElement("canvas");
    canvas.id = "line" + String(this._count++);
    canvas.width = Math.abs(endX)
    canvas.width = endX - startX;
    canvas.height = Math.abs(endY - startY);
    canvas.style.position = "absolute";
    canvas.style.left = String(startX) + "px";
    canvas.style.top = String(isTopToBottom ? startY : endY) + "px";

    let context = canvas.getContext("2d");
    context.moveTo(0, isTopToBottom ? 0 : canvas.height);
    context.lineTo(canvas.width, isTopToBottom ? canvas.height : 0);
    context.stroke();

    document.getElementById(proofListId).appendChild(canvas);
}

function displayXInProof(offsetLeft, offsetTop) {

    if (!this._count) {
        this._count = 1;
    }

    let x = document.createElement("p");
    x.id = "close" + String(this._count++);
    x.style.position = "absolute";
    x.style.left = String(offsetLeft) + "px";
    x.style.top = String(offsetTop) + "px";
    x.innerHTML = "🞩";
    document.getElementById(proofListId).appendChild(x);
}

function measureWidthInProof(str) {
    let para = makeProofParagraph(str);
    para.style.color = "white";
    document.body.appendChild(para);
    let width = para.clientWidth;
    document.body.removeChild(para);
    return width;
}