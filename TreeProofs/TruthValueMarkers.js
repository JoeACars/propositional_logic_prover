"use strict";

const imgOffsetTop = 5.5;
const imgHeight = 11;
const codeTrue = "t";
const codeFalse = "f";
const codeNotTrue = "nt";
const codeNotFalse = "nf";
const truthValueMarkerCodes = [codeTrue, codeFalse, codeNotTrue, codeNotFalse];

/// Represents the truth-value statement associated with a line
class TruthValueMarker {

    constructor(code) {
        if (!truthValueMarkerCodes.includes(code)) {
            throw new Error("<" + code + "> is not a valid truth value marker code.");
        }
        this._code = code;

        let imgSrc = "";
        if (code === codeTrue) {
            imgSrc = "truthmarkertrue.png"
        }
        else if (code === codeFalse) {
            imgSrc = "truthmarkerfalse.png"
        }
        else if (code === codeNotTrue) {
            imgSrc = "truthmarkernottrue.png"
        }
        else if (code === codeNotFalse) {
            imgSrc = "truthmarkernotfalse.png"
        }
        this._disp = "<img style=\"position: relative; "
                        + "top: " + String(imgOffsetTop) + "px\" "
                        + "height = \"" + String(imgHeight) + "\" "
                        + "width = \"" + String(imgHeight) + "\" "
                        + "src = \"" + imgSrc + "\" />";
    }

    isTrue() {
        return this._code === codeTrue;
    }
    isFalse() {
        return this._code === codeFalse;
    }
    isNotTrue() {
        return this._code === codeNotTrue;
    }
    isNotFalse() {
        return this._code === codeNotFalse;
    }

    isTruthy() {
        return this.isTrue() || this.isNotFalse();
    }
    isFalsy() {
        return this.isFalse() || this.isNotTrue();
    }

    contradicts(other) {
        if (!(other instanceof TruthValueMarker)) {
            return false;
        }
        if (this.isTrue()) {
            return other.isNotTrue();
        }
        if (this.isFalse()) {
            return other.isNotFalse();
        }
        if (this.isNotTrue()) {
            return other.isTrue();
        }
        if (this.isNotFalse()) {
            return other.isFalse();
        }
        return false;
    }

    getDisplayString() {
        return this._disp;
    }

}

const truthValueMarkers = {
    isTrue: new TruthValueMarker(codeTrue),
    isFalse: new TruthValueMarker(codeFalse),
    isNotTrue: new TruthValueMarker(codeNotTrue),
    isNotFalse: new TruthValueMarker(codeNotFalse)
};
Object.freeze(truthValueMarkers);
export default truthValueMarkers;