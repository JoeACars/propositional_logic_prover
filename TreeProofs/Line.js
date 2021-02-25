"use strict";

import { isLineContent } from "./LineContent.js";
import justifications from "./Justifications.js";
import measureWidthInProof from "../Display/MeasureWidthInProof.js";
import operators from "../Syntax/Operators.js";

/// A line in the proof.
/// Contains the line number, line content and justification and can find out whether it is usable or not.
export default class Line {

    constructor(lineNumber, lineContent, justification) {

        // line number in the proof
        this._number = lineNumber;

        // the content of the line - either sentence (and world), or accessibility relation
        if (!isLineContent(lineContent)) {
            throw new Error("Line constructor was called without a LineContent object.");
        }
        this._content = lineContent;

        // the justification for adding this line to the proof
        if (!Object.values(justifications).some(justificationType => justification instanceof justificationType)) {
            throw new Error("Line constructor was called without a Justification-type object");
        }
        this._justification = justification;

        this._lineLastUsed = null;  // the most recent Line in which this Line was used

        // Prepare display string sections: "X.", "sentence (world)" or "wRv", "(justification)"

        this._dispStrLineNumber = String(this._number) + ".";
        this._dispStrContent = this._content.getDisplayString();
        this._dispStrJustification = this._justification.getDisplayString();

        this._minDisplayWidth = measureWidthInProof(this.getDisplayString());
    }

    getDisplayString(numSpacesBeforeJustification = 0) {

        // Line number
        let displayStr = this._dispStrLineNumber;
        let numSpacesAfterLineNumber = String(Line._maxLineNumber) + 2 - displayStr.length;
        for (let i = 0; i < numSpacesAfterLineNumber; i++) {
            displayStr += " ";
        }

        // Content
        displayStr += this._dispStrContent + "   ";

        // Add spaces before justification so that the line is the right width
        for (let i = 0; i < numSpacesBeforeJustification; i++) {
            displayStr += " ";
        }

        // Justification
        displayStr += this._dispStrJustification;

        return displayStr;

    }

    getLineNumber() {
        return this._number;
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
        let sentence = this._content?.getSentence();
        // Unused?
        if (this._lineLastUsed === null || !sentence) {
            return true;
        }
        // Sentence-letter?
        if (sentence.getOperator().isEqual(operators.trivialOperator)) {
            return true;
        }
        // Negated sentence-letter?
        if (sentence.getOperator().isEqual(operators.negation) && operators.trivialOperator.isEqual(sentence.getOperand(0).getOperator())) {
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