"use strict";

import Segment from "./Segment.js";
import Line from "./Line.js";

/// The tree proof.
export default class TreeProof {

    constructor() {
        this.clear();
    }

    clear() {
        this._rootSegment = null;
        this._activeSegment = null;
        this._isComplete = false;
    }

    isComplete() {
        return this._isComplete;
    }

    isValid() {
        if (this._isComplete) {
            return this._rootSegment.isClosed();
        }
    }

    getUsableLines() {
        return this._activeSegment.getUsableLines();
    }

    getActiveLines() {
        return this._activeSegment.getActiveLines();
    }

    getDisplayWidth() {
        if (!this._rootSegment) return 0;
        if (!this._isComplete) return NaN;
        return this._rootSegment.getMinDisplayWidth();
    }

    getLength() {
        return this._rootSegment ? this._rootSegment.getLength() : 0;
    }

    getRootSegment() {
        return this._rootSegment;
    }

    addNewLine(lineContent, lineJustification) {
        let line = new Line(this.getLength() + 1, lineContent, lineJustification);
        this.addLine(line);
        return line;
    }

    addLine(line) {

        if (this._isComplete) {
            console.log("Can't add premises - proof is complete!")
            return;
        }

        // If empty, start the proof!
        if (!this._rootSegment) {
            this._rootSegment = new Segment();
            this._activeSegment = this._rootSegment;
        }

        // Now we're definitely ready, extend the proof.
        this._activeSegment.addLine(line);

    }

    /// Ends the active segment with a split, and creates new Lines with the appropriate line numbers.
    /// Takes a 3D array - the first dimension is for each new segment, the second is for each line
    /// on any one branch, and the third is a pair [lineContent, justification].
    splitWithNewLines(...newLinesBySegment) {
        let lineNumber = this.getLength() + 1;
        let linesBySegment = newLinesBySegment.map(segmentNewLines => {
            return segmentNewLines.map(segmentNewLine => {
                let [lineContent, justification] = segmentNewLine;
                return new Line(lineNumber++, lineContent, justification);
            })
        });
        this.split(...linesBySegment);
        let lines = [];
        linesBySegment.forEach(segmentLines => lines.push(segmentLines));
        return lines;
    }

    /// Ends the active segment with a split.
    /// Takes a list of arrays of lines, where each array of lines are the starting lines of each new segment.
    split(...linesBySegment) {

        if (this._isComplete) {
            console.log("Can't split - proof is complete!");
            return;
        }

        if (!linesBySegment) {
            console.log("Couldn't split proof - no lines provided!");
            return;
        }

        let childSegments = [];
        for (let lines of linesBySegment) {
            let segment = new Segment(this._activeSegment);
            lines.forEach(line => segment.addLine(line));
            childSegments.push(segment);
        }
        this._activeSegment.split(...childSegments);
        this._activeSegment = childSegments[0];
    }

    _moveToNextSegment() {
        // Move up to the closest unfinished segment
        while (this._activeSegment.isFinished()) {
            this._activeSegment = this._activeSegment.getParent();
            if (this._activeSegment === null) {
                this._lock();
                return;
            }
        }
        // Move down to the first unfinished child
        this._activeSegment = this._activeSegment.getFirstUnfinishedChild();
    }

    closeActiveSegment() {
        this._activeSegment.close();
        this._moveToNextSegment();
    }

    leaveActiveSegmentOpen() {
        this._activeSegment.leaveOpen();
        this._moveToNextSegment();
    }

    _lock() {
        this._isComplete = true;
    }
}