"use strict";

import operators from "../Syntax/Operators.js";

export default function containsContradiction(sentences) {
    for (let sentence of sentences) {
        if (sentence.getOperator().isEqual(operators.negation)) {
            if (sentences.some(otherSentence => otherSentence.isEqual(sentence.getOperand(0)))) {
                return true;
            }
        }
    }
    return false;
}