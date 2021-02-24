"use strict";

import Line from "./Line.js";

const endOpen = "open";
const endClose = "close";
const endSplit = "split";

/// A segment in the tree proof, running from a root to an open end, close or split.
/// Contains the list of lines in the segment.
export default class Segment {

    constructor(parent = null) {
        this._lines = [];       // A list of Lines
        this._end = undefined;   // Whether the branch ending is open, close, or split
        this._parent = parent;  // Parent segment, if it has one.
        this._children = [];    // If split, the child segments that it splits into
    }

    hasLine(line) {
        return this._lines.includes(line);
    }

    getLength() {
        return this._lines.length;
        return this._lines.length;
    }

    isFinished() {
        if (this.isEndSplit()) {
            return !this._children.some(child => !child.isFinished());
        }
        return this._end !== undefined && this._end !== null;
    }

    isEndClose() {
        return this._end === endClose;
    }

    isEndOpen() {
        return this._end === endOpen;
    }

    isEndSplit() {
        return this._end === endSplit;
    }

    isClosed() {
        if (this._end === endOpen) {
            return false;
        }

        if (this._end === endClose) {
            return true;
        }

        if (this._end === endSplit) {
            return !this._children.some(child => !child.isClosed());
        }

        return false;
    }

    getParent() {
        return this._parent;
    }

    getFirstUnfinishedChild() {
        return this._children.find(child => !child.isFinished());
    }

    getUsableLines() {
        let usableLines = [];
        for (line of this._lines) {
            if (line.isUsable()) {
                usableLines.push(line);
            }
        }
        if (this._parent) {
            usableLines.push(...this._parent.getUsableLines());
        }
        return usableLines;
    }

    getActiveLines() {
        let activeLines = [];
        activeLines.push(...this._lines);
        if (this._parent) {
            activeLines.push(...this._parent.getActiveLines());
        }
        return activeLines;
    }

    getLocalMinDisplayWidth() {
        return this._localMinDisplayWidth;
    }

    /// Calculates the min display width of this segment, including its children
    calculateLocalMinDisplayWidth() {

        // First, max min width of any lines in this segment
        let thisMaxMinWidth = 0;
        for (let line of this._lines) {
            thisMaxMinWidth = Math.max(thisMaxMinWidth, line.getMinDisplayWidth());
        }

        // Then, min width of child segments, added together, with padding
        let splitMinWidth = 0;
        if (this.isEndSplit()) {
            this._children.forEach(child => {
                child.calculateLocalMinDisplayWidth();
                splitMinWidth += child.getLocalMinDisplayWidth();
            });
            splitMinWidth += paddingBetweenBranches * (this._children.length - 1);
        }

        this._localMinDisplayWidth = Math.max(thisMaxMinWidth, splitMinWidth);

    }

    leaveOpen() {
        this._end = endOpen;
    }

    close() {
        this._end = endClose;
    }

    split(...children) {
        this._end = endSplit;
        this._children = children;
    }

    /// Display this segment, including all its child segments
    display(offsetLeft, offsetTop) {

        // First, display this segment's lines
        let thisSegmentWidth = Math.max(...this._lines.map(line => line.getMinDisplayWidth()));
        let thisSegmentOffsetLeft = offsetLeft + ((this._localMinDisplayWidth - thisSegmentWidth) / 2);
        for (let line of this._lines) {
            line.display(thisSegmentOffsetLeft, offsetTop, thisSegmentWidth);
            offsetTop += lineHeight;
        }

        // If open, that's all!
        if (this.isEndOpen()) {
            return;
        }

        // If close, display an x and finish.
        if (this.isEndClose()) {
            displayXInProof(offsetLeft + (thisSegmentWidth / 2), offsetTop);
            return;
        }

        // Otherwise split, so display child segments
        let childWidths = this._children.map(child => child.getLocalMinDisplayWidth());
        let offsetTopChildren = offsetTop + paddingUnderSplit;
        let lineStartX = thisSegmentOffsetLeft + (thisSegmentWidth / 2);
        let lineStartY = offsetTop + lineVerticalPaddingBefore;
        let lineEndY = offsetTopChildren - lineVerticalPaddingAfter;
        for (let i = 0; i < this._children.length; i++) {
            drawLineInProof(lineStartX, lineStartY, offsetLeft + (childWidths[i] / 2), lineEndY);
            this._children[i].display(offsetLeft, offsetTopChildren);
            offsetLeft += childWidths[i] + paddingBetweenBranches;
        }
    }

    addLine(line) {
        if (!(line instanceof Line)) {
            throw new Error("addLine() was called on a Segment without providing a Line.");
		}
        if (!this.hasLine(line)) {
            this._lines.push(line);
        }
    }
}