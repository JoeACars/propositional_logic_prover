"use strict";

import truthValueMarkers from "./TruthValueMarkers.js";
import Sentence from "../Syntax/Sentence.js";

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

        super(LineContent._sentenceType);

        if (Object.values(truthValueMarkers).includes(truthValueMarker)) {
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

export function isLineContent(obj) {
    return obj instanceof LineContent;
}