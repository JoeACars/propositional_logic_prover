"use strict";

import Segment from "./Segment.js";
import Line from "./Line.js";

/// The tree proof.
export default class TreeProof {

    static _rootSegment = null;
    static _activeSegment = null;
    static _isComplete = false;

    static clear() {
        this._rootSegment = null;
        this._activeSegment = null;
        this._isComplete = false;
    }

    static isComplete() {
        return this._isComplete;
    }

    static isValid() {
        if (this._isComplete) {
            return this._rootSegment.isClosed();
        }
    }

    static getUsableLines() {
        return this._activeSegment.getUsableLines();
    }

    static getActiveLines() {
        return this._activeSegment.getActiveLines();
    }

    static getDisplayWidth() {
        if (!this._rootSegment) return 0;
        if (!this._isComplete) return NaN;
        return this._rootSegment.getMinDisplayWidth();
    }

    static getLength() {
        return Line.getMaxLineNumber();
    }

    static getRootSegment() {
        return this._rootSegment;
    }

    static addLine(line) {

        if (this._isComplete) {
            console.log("Can't add premises - proof is complete!")
            return;
        }

        // If empty, start the proof!
        if (!this._rootSegment) {
            this._rootSegment = new Segment();
            this._activeSegment = this._rootSegment;
            this._rootSegment.addLine(line);
            return;
        }

        // Otherwise, extend the proof.
        this._activeSegment.addLine(line);

    }

    /// Ends the active segment with a split.
    /// Takes a list of arrays of lines, where each array of lines are the starting lines of each new segment.
    static split(...splitLines) {

        if (this._isComplete) {
            console.log("Can't split - proof is complete!");
            return;
        }

        if (!splitLines) {
            console.log("Couldn't split proof - no lines provided!");
            return;
        }

        let childSegments = [];
        for (let lines of splitLines) {
            let segment = new Segment(this._activeSegment);
            lines.forEach(line => segment.addLine(line));
            childSegments.push(segment);
        }
        this._activeSegment.split(...childSegments);
        this._activeSegment = childSegments[0];
    }

    static _moveToNextSegment() {
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

    static closeActiveSegment() {
        this._activeSegment.close();
        this._moveToNextSegment();
    }

    static leaveActiveSegmentOpen() {
        this._activeSegment.leaveOpen();
        this._moveToNextSegment();
    }

    static _lock() {
        this._isComplete = true;
    }
}