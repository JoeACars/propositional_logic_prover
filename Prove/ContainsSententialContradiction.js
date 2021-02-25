"use strict";

import operators from "../Syntax/Operators.js";
import { LineContentSentence } from "../TreeProofs/LineContent.js";

export default function containsSententialContradiction(lines) {

    // Retrieve sentential line contents
    let contents = [];
    lines.forEach(line => {
        let content = line.getLineContent();
        if (content instanceof LineContentSentence) {
            contents.push(content);
        }
    });

    // Find contradictions
    for (let content of contents) {
            if (content.getSentence().getOperator().isEqual(operators.negation)) {
                if (contents.some(otherContent => areContentsContradictory(content, otherContent))) {
                    return true;
                }
            }
    }
    return false;
    
}

function areContentsContradictory(content1, content2) {
    if (!(content1 instanceof LineContentSentence) || !(content2 instanceof LineContentSentence)) {
        return false;
    }
    if (content1.getWorld() !== content2.getWorld()) {
        return false;
    }
    let sentence1 = content1.getSentence();
    let sentence2 = content2.getSentence();
    if (sentence1.getOperator().isEqual(operators.negation) && sentence1.getOperand(0).isEqual(sentence2)) {
        return true;
    }
    if (sentence2.getOperator().isEqual(operators.negation) && sentence2.getOperand(0).isEqual(sentence1)) {
        return true;
    }
    return false;
}