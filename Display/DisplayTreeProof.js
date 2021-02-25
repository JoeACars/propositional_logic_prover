//////////////////////////////
//////// Display.js //////////
//////////////////////////////

/// This file contains functions to do with displaying things to the user.

"use strict";

import makeTreeProofParagraph from "./MakeTreeProofParagraph.js";
import measureWidthInProof from "./MeasureWidthInProof.js";
import { TreeProof } from "../Prove.js";
import Segment from "../TreeProofs/Segment.js";
import Line from "../TreeProofs/Line.js";

let validityResultId = "validityResult";
let proofDivId = "proof";
let paddingBetweenBranches = 128;
let lineHeight = 22;
let paddingUnderSplit = 64;
let lineVerticalPaddingBefore = 16;
let lineVerticalPaddingAfter = -10;

export default function displayTreeProof(offsetLeft = 10, offsetTop = 500) {
    clearProof();
    if (TreeProof.getLength() === 0) {
        console.log("Proof was empty!");
        return;
    }
    displaySegment(TreeProof.getRootSegment(), offsetLeft, offsetTop);
    displayValidityResult(offsetLeft, offsetTop - lineHeight);
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
        offsetTop += lineHeight;
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
    let offsetTopChildren = offsetTop + paddingUnderSplit;
    let lineStartX = ownLinesOffsetLeft + (ownLinesWidth / 2);
    let lineStartY = offsetTop + lineVerticalPaddingBefore;
    let lineEndY = offsetTopChildren - lineVerticalPaddingAfter;
    for (let i = 0; i < children.length; i++) {
        drawLineInProof(lineStartX, lineStartY, offsetLeft + (childWidths[i] / 2), lineEndY);
        children[i].display(offsetLeft, offsetTopChildren);
        offsetLeft += childWidths[i] + paddingBetweenBranches;
    }
}

function displayLine(line, offsetLeft, offsetTop, width) {
    let excessWidth = width - line.getMinDisplayWidth();
    let numSpaces = excessWidth / spaceWidthInProof();
    let para = makeTreeProofParagraph(line.getDisplayString(numSpaces), offsetLeft, offsetTop);
    document.getElementById(proofDivId).appendChild(para);
}

function spaceWidthInProof() {
    if (!this._value) {
        this._value = measureWidthInProof(" ");
    }
    return this._value;
}

export function displayValidityResult(offsetLeft, offsetTop) {
    let validityResult = document.getElementById(validityResultId);
    validityResult.style.position = "absolute";
    let validityStr;
    if (TreeProof.isValid()) {
        validityStr = "<span style=\"color: green\">VALID</span>";
    }
    else {
        validityStr = "<span style=\"color: red\">INVALID</span>";
    }
    validityResult.style.left = String(offsetLeft + ((TreeProof.getDisplayWidth() - measureWidthInProof(validityStr)) / 2)) + "px";
    validityResult.style.top = String(offsetTop) + "px";
    validityResult.innerHTML = validityStr;
}

export function clearProof() {
    TreeProof.clear();
    let proof = document.getElementById(proofDivId);
    while (proof.children.length > 0) {
        proof.removeChild(proof.children[0]);
    }
    Line.resetLineNumber();
}

export function padProof() {
    let proofElems = document.getElementById(proofDivId).childNodes.values();
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
    document.getElementById(proofDivId).appendChild(pad);
}

export function drawLineInProof(startX, startY, endX, endY) {

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

    document.getElementById(proofDivId).appendChild(canvas);
}

export function displayXInProof(offsetLeft, offsetTop) {

    if (!this._count) {
        this._count = 1;
    }

    let x = document.createElement("p");
    x.id = "close" + String(this._count++);
    x.style.position = "absolute";
    x.style.left = String(offsetLeft) + "px";
    x.style.top = String(offsetTop) + "px";
    x.innerHTML = "🞩";
    document.getElementById(proofDivId).appendChild(x);
}