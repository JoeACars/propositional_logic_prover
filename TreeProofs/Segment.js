"use strict";

import Line from "./Line.js";
import displayConstants from "../Display/DisplayConstants.js";

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

    getOwnLength() {
        return this._lines.length;
    }

    getLength() {
        let length = this.getOwnLength();
        if (this.isEndSplit()) {
            this._children.forEach(child => length += child.getLength());
        }
        return length;
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

    getChildren() {
        return this._children;
    }

    getUsableLines() {
        let usableLines = [];
        for (let line of this._lines) {
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

    getLines() {
        return this._lines;
    }

    getOwnLinesMaxDisplayWidth() {
        if (!this._ownLinesMaxDisplayWidth) {
            this._ownLinesMaxDisplayWidth = Math.max(...this._lines.map(line => line.getMinDisplayWidth()))
        }
        return this._ownLinesMaxDisplayWidth;
    }

    getMinDisplayWidth() {
        if (!this._minDisplayWidth) {
            this._calculateMinDisplayWidth();
        }
        return this._minDisplayWidth;
    }

    /// Calculates the min display width of this segment, including its children
    _calculateMinDisplayWidth() {

        // First, max min width of any lines in this segment
        let thisMaxMinWidth = 0;
        for (let line of this._lines) {
            thisMaxMinWidth = Math.max(thisMaxMinWidth, line.getMinDisplayWidth());
        }

        // Then, min width of child segments, added together, with padding
        let splitMinWidth = 0;
        if (this.isEndSplit()) {
            this._children.forEach(child => {
                child._calculateMinDisplayWidth();
                splitMinWidth += child.getMinDisplayWidth();
            });
            splitMinWidth += displayConstants.paddingBetweenBranches * (this._children.length - 1);
        }

        this._minDisplayWidth = Math.max(thisMaxMinWidth, splitMinWidth);

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

    addLine(line) {
        if (!(line instanceof Line)) {
            throw new Error("addLine() was called on a Segment without providing a Line.");
		}
        if (!this.hasLine(line)) {
            this._lines.push(line);
            this._minDisplayWidth = null;
            this._ownLinesMaxDisplayWidth = null;
        }
    }
}