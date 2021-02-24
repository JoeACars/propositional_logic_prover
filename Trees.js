////////////////////////////////////
///////////// Trees.js /////////////
////////////////////////////////////

/// This file contains everything relating to tree proofs.

import { operators } from ".\Syntax";

"use strict";



/// The tree proof.
/// We only do one at any one time, so everything is static.
export class TreeProof {

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
        return this._rootSegment.getLocalMinDisplayWidth();
    }

    static getLength() {
        return Line.getMaxLineNumber() - 1;
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
        this._rootSegment.calculateLocalMinDisplayWidth();
    }

    static display(offsetLeft = 10, offsetTop = 500) {
        if (!this._rootSegment) {
            console.log("Can't display proof - empty!")
            return;
        }
        this._rootSegment.display(offsetLeft, offsetTop);
    }
}

/// A segment in the tree proof, running from a root to an open end, close or split.
/// Contains the list of lines in the segment.
export class Segment {

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
        return this._end === "close";
    }

    isEndOpen() {
        return this._end === "open";
    }

    isEndSplit() {
        return this._end === "split";
    }

    isClosed() {
        if (this._end === "open") {
            return false;
        }

        if (this._end === "close") {
            return true;
        }

        if (this._end === "split") {
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
        this._end = "open";
    }

    close() {
        this._end = "close";
    }

    split(...children) {
        this._end = "split";
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
        if (!this.hasLine(line)) {
            this._lines.push(line);
        }
    }
}

/// A line in the proof.
/// Contains the line number, line content and justification and can find out whether it is usable or not.
export class Line {

    static _maxLineNumber = 0;

    static resetLineNumber() {
        this._maxLineNumber = 0;
    }

    constructor(lineContent, justification) {

        // line number in the proof
        this._number = ++Line._maxLineNumber;

        // the content of the line - either sentence (and world), or accessibility relation
        if (!(LineContent instanceof LineContent)) {
            throw new Error("Line constructor was called without a LineContent object.");
        }
        this._content = lineContent;

        // the justification for adding this line to the proof
        if (!justifications.values().includes(justification)) {
            throw new Error("Line constructor was called without a Justification-type object");
        }
        this._justification = justification;    

        this._lineLastUsed = null;  // the most recent Line in which this Line was used

        // Prepare display string sections: "X.", "sentence (world)" or "wRv", "(justification)"

        this._dispStrLineNumber = String(this._number) + ".";
        this._dispStrContent = this._content.getDisplayString();
        this._dispStrJustification = this._justification.displayString();

        this._minDisplayWidth = measureWidthInProof(this.getDisplayString());
    }

    getDisplayString(width = -1) {

        // Line number
        let displayStr = this._dispStrLineNumber;
        let numSpacesAfterLineNumber = String(TreeProof.getLength()).length + 2 - displayStr.length;
        for (let i = 0; i < numSpacesAfterLineNumber; i++) {
            displayStr += " ";
        }

        // Content
        displayStr += this._dispStrContent + "   ";

        // Add spaces before justification so that the line is the right width
        let excessWidth = width - this._minDisplayWidth;
        for (let i = 0; i < excessWidth / spaceWidthInProof(); i++) {
            displayStr += " ";
        }

        // Justification
        displayStr += this._dispStrJustification;

        return displayStr;

    }

    display(offsetLeft, offsetTop, width) {
        let para = makeProofParagraph(this.getDisplayString(width), offsetLeft, offsetTop);
        document.getElementById(proofListId).appendChild(para);
    }

    getLineNumber() {
        return this._number;
    }

    static getMaxLineNumber() {
        return this._maxLineNumber;
    }

    getLineContent() {
        return this._content;
    }

    getMinDisplayWidth() {
        return this._minDisplayWidth;
    }

    /// If true, this line is currently available to be used in the proof. If false, this line
    /// has contributed all it can to the proof for now.
    isUsable() {
        console.log("Line.isUsed() is only written for non-modal semantics. Just warning you!");
        let sentence = this._content?.sentence;
        // Unused?
        if (this._lineLastUsed === null || !sentence) {
            return true;
        }
        // Sentence-letter?
        if (sentence.operator.isEqual(operators.trivialOperator)) {
            return true;
        }
        // Negated sentence-letter?
        if (sentence.operator.isEqual(operators.negation) && hasEqualEntries(sentence.operands[0].operator, operators.trivialOperator)) {
            return true;
        }
        return false;
    }

    /// Tells this line that it has been used somewhere else.
    setUsed(otherLine) {
        if (otherLine.getLineNumber() > this.getLineNumber()) {
            this._lineLastUsed = otherLine;
        }
    }
}

/// Makes a new justification class with the given name, short display string and length, i.e. number of arguments.
function Justification(name, disp, length) {

    let justification = class {

        static _length;
        static _name;
        static _disp;

        constructor(...args) {
            if (args.length !== justification._length) {
                return;
            }
            this._args = args;
        }

        getName() {
            return justification._name;
        }

        getArgument(index) {
            return this._args[index];
        }

        displayString() {

            let displayStr = "(";

            if (justification._disp && justification._disp !== "") {
                displayStr += justification._disp + ", ";
            }

            for (let arg of this._args) {
                displayStr += String(arg.getLineNumber()) + ", ";
            }

            if (displayStr === "(") {
                return "";
            }
            displayStr = displayStr.slice(0, displayStr.length - 2) + ")";

            return displayStr;
        }
    };
    justification.name = name;
    justification._length = length;
    justification._name = name;
    justification._disp = disp;

    if (!this.justifications) {
        this.justifications = [];
    }
    this.justifications.push(justification);

    return justification;

};
export const justifications;
Object.defineProperty(justifications, "JustPremise", { value: Justification("premise", "pr", 0), enumerable: true });
Object.defineProperty(justifications, "Conclusion", { value: Justification("conclusion", "c", 0), enumerable: true });
Object.defineProperty(justifications, "NE", { value: Justification("negation elimination", "", 1), enumerable: true });
Object.defineProperty(justifications, "DNE", { value: Justification("double negation elimination", "", 1), enumerable: true });
Object.defineProperty(justifications, "SplitDisj", { value: Justification("disjunctive split by cases", "", 1), enumerable: true });
Object.defineProperty(justifications, "SplitCond", { value: Justification("conditional split by cases", "", 1), enumerable: true });
Object.defineProperty(justifications, "SplitConj", { value: Justification("conjunctive split by cases", "", 1), enumerable: true });
Object.defineProperty(justifications, "ExpDisj", { value: Justification("disjunctive expansion", "", 1), enumerable: true });
Object.defineProperty(justifications, "ExpConj", { value: Justification("conjunctive expansion", "", 1), enumerable: true });
Object.defineProperty(justifications, "ExpCond", { value: Justification("conditional expansion", "", 1), enumerable: true });

/// Base class for LineContent. Shouldn't be instantiated.
class LineContent {

    static _sentenceType = "sent";
    static _accessibilityRelationType = "access";
    static _types = [this._sentenceType, this._accessibilityRelationType];

    constructor(type) {
        if (!LineContent._types.includes(type)) {
            throw new Error(type + " is not a valid type for a LineContent object.");
        }
        this._type = type;
    }

    getDisplayString() {
        throw new Error("Some LineContent class didn't implement getDisplayString()!");
    }
}

/// Makes a new line content object for a sentence holding (at a world, if applicable)
export class LineContentSentence extends LineContent {

    constructor(sentence, truthValueMarker = null, world = null) {

        super(super._sentenceType);

        if (truthValueMarker instanceof TruthValueMarker) {
            this._truthValueMarker = truthValueMarker;
        }
        else {
            this._truthValueMarker = null;
        }

        if (!(sentence instanceof Sentence)) {
            throw new Error("LineContentSentence constructor was called without a Sentence.");
        }
        this._sentence = sentence;

        this._world = world;
    }

    getTruthValueMarker() {
        return this._truthValueMarker;
    }
    getSentence() {
        return this._sentence;
    }
    getWorld() {
        return this._world;
    }

    getDisplayString() {

        let displayStr = "";
        if (this._truthValueMarker) {
            displayStr += this._truthValueMarker.getDisplayString();
        }

        displayStr += this._sentence.getDisplayString();

        if (this._world) {
            throw new Error("Worlds aren't implemented yet!");
        }

        return displayStr;
    }
}

/// Makes a new line content object for an accessibility relation, e.g. wRv.
export class LineContentAccessibilityRelation extends LineContent {
    constructor(relation, ...worlds) {
        throw new Error("Accessibility relations are not fully implemented yet!");
        super(LineContent._accessibilityRelationType);
        this._relation = relation;
        this._worlds = worlds;
    }
}

/// Represents the truth-value statement associated with a line
class TruthValueMarker {

    static _true = "t";
    static _false = "f";
    static _notTrue = "nt";
    static _notFalse = "nf";
    static _truthValues = [_true, _false, _notTrue, _notFalse];

    constructor(code) {
        if (!_truthValues.includes(code)) {
            throw new Error("<" + code + "> is not a valid truth value marker code.");
        }
        this._code = code;

        let imgSrc = "";
        if (code === _true) {
            imgSrc = "truthmarkertrue.png"
        }
        else if (code === _false) {
            imgSrc = "truthmarkerfalse.png"
        }
        else if (code === _notTrue) {
            imgSrc = "truthmarkernottrue.png"
        }
        else if (code === _notFalse) {
            imgSrc = "truthmarkernotfalse.png"
        }
        this._disp = "<img style=\"position: relative; top: " + String(lineHeight / 4) + "px\" height = \"11\" width = \"11\" src = \"" + imgSrc + "\" />";
    }

    isTrue() {
        return this._code === TruthValueMarker._true;
    }
    isFalse() {
        return this._code === TruthValueMarker._false;
    }
    isNotTrue() {
        return this._code === TruthValueMarker._notTrue;
    }
    isNotFalse() {
        return this._code === TruthValueMarker._notFalse;
    }
    getDisplayString() {
        return this._disp;
    }

}
export const truthValueMarkerTrue = new TruthValueMarker("t");
export const truthValueMarkerFalse = new TruthValueMarker("f");
export const truthValueMarkerNotTrue = new TruthValueMarker("nt");
export const truthValueMarkerNotFalse = new TruthValueMarker("nf");