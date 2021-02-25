//////////////////////////////
//////// Display.js //////////
//////////////////////////////

/// This file contains functions to do with displaying things to the user.

"use strict";

import makeTreeProofParagraph from "./MakeTreeProofParagraph.js";
import measureWidthInProof from "./MeasureWidthInProof.js";
import TreeProof from "../TreeProofs/TreeProof.js";
import Segment from "../TreeProofs/Segment.js";
import displayConstants from "../Display/DisplayConstants.js";
import htmlElemIds from "../HTMLElemIds.js";

export default function displayTreeProof(treeProof, offsetLeft = 10, offsetTop = 500) {

    if (!(treeProof instanceof TreeProof)) {
        throw new Error("displayTreeProof() was called without a TreeProof!");
    }

    clearProof();
    if (treeProof.getLength() === 0) {
        console.log("Proof was empty!");
        return;
    }
    displaySegment(treeProof.getRootSegment(), offsetLeft, offsetTop);
    displayValidityResult(treeProof, offsetLeft, offsetTop - displayConstants.lineHeight);
    padProof();
}

/// Display a Segment, along with all its child Segments
function displaySegment(segment, offsetLeft, offsetTop) {

    if (!(segment instanceof Segment)) {
        throw new Error("displaySegment() was called without a Segment!");
    }

    // First, display this segment's lines
    let ownLinesWidth = segment.getOwnLinesMaxDisplayWidth();
    let ownLinesOffsetLeft = offsetLeft + ((segment.getMinDisplayWidth() - ownLinesWidth) / 2);
    for (let line of segment.getLines()) {
        displayLine(line, ownLinesOffsetLeft, offsetTop, ownLinesWidth);
        offsetTop += displayConstants.lineHeight;
    }

    // If open, that's all!
    if (segment.isEndOpen()) {
        return;
    }

    // If close, display an x and finish.
    if (segment.isEndClose()) {
        displayXInProof(offsetLeft + (ownLinesWidth / 2), offsetTop);
        return;
    }

    // Otherwise split, so display child segments
    let children = segment.getChildren();
    let childWidths = children.map(child => child.getMinDisplayWidth());
    let offsetTopChildren = offsetTop + displayConstants.paddingUnderSplit;
    let lineStartX = ownLinesOffsetLeft + (ownLinesWidth / 2);
    let lineStartY = offsetTop + displayConstants.lineVerticalPaddingBefore;
    let lineEndY = offsetTopChildren - displayConstants.lineVerticalPaddingAfter;
    for (let i = 0; i < children.length; i++) {
        drawLineInProof(lineStartX, lineStartY, offsetLeft + (childWidths[i] / 2), lineEndY);
        displaySegment(children[i], offsetLeft, offsetTopChildren);
        offsetLeft += childWidths[i] + displayConstants.paddingBetweenBranches;
    }
}

function displayLine(line, offsetLeft, offsetTop, width) {
    let excessWidth = width - line.getMinDisplayWidth();
    let numSpaces = excessWidth / spaceWidthInProof();
    let para = makeTreeProofParagraph(line.getDisplayString(numSpaces), offsetLeft, offsetTop);
    document.getElementById(htmlElemIds.proofDiv).appendChild(para);
}

const spaceWidthInProof = (function() {
    let value = -1;
    return function() {
        if (value === -1) {
            value = measureWidthInProof(" ");
        }
        return value;
    };
})();

export function displayValidityResult(treeProof, offsetLeft, offsetTop) {
    let validityResult = document.getElementById(htmlElemIds.validityResult);
    validityResult.style.position = "absolute";
    let validityStr;
    if (treeProof.isValid()) {
        validityStr = "<span style=\"color: green\">VALID</span>";
    }
    else {
        validityStr = "<span style=\"color: red\">INVALID</span>";
    }
    validityResult.style.left = String(offsetLeft + ((treeProof.getDisplayWidth() - measureWidthInProof(validityStr)) / 2)) + "px";
    validityResult.style.top = String(offsetTop) + "px";
    validityResult.innerHTML = validityStr;
}

export function clearProof() {
    let proofElem = document.getElementById(htmlElemIds.proofDiv);
    while (proofElem.children.length > 0) {
        proofElem.removeChild(proofElem.children[0]);
    }
}

export function padProof() {
    let proofElems = document.getElementById(htmlElemIds.proofDiv).childNodes.values();
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
    pad.style.top = String(maxOffsetTop + 2 * displayConstants.lineHeight) + "px";
    pad.style.left = String(maxOffsetLeft + displayConstants.lineHeight) + "px";
    document.getElementById(htmlElemIds.proofDiv).appendChild(pad);
}

export const drawLineInProof = (function() {

    let count = 1;

    return function(startX, startY, endX, endY) {
        // Always go left-to-right
        if (startX > endX) {
            [startX, endX] = [endX, startX];
            [startY, endY] = [endY, startY];
        }
        let isTopToBottom = startY <= endY;

        let canvas = document.createElement("canvas");
        canvas.id = "line" + String(count++);
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

        document.getElementById(htmlElemIds.proofDiv).appendChild(canvas);
    };
})();

export const displayXInProof = (function() {

    let count = 1;

    return function(offsetLeft, offsetTop) {
        let x = document.createElement("p");
        x.id = "close" + String(count++);
        x.style.position = "absolute";
        x.style.left = String(offsetLeft) + "px";
        x.style.top = String(offsetTop) + "px";
        x.innerHTML = "🞩";
        document.getElementById(htmlElemIds.proofDiv).appendChild(x);
    };
})();