//////////////////////////////
////////// Prove.js //////////
//////////////////////////////

/// This file contains the functions for generating proofs in every implemented language.

"use strict";

import {
    TreeProof,
    Line,
    LineContentSentence,
    justifications
} from "./Trees";
import {
    operators
} from "./Syntax";


export function proveClassicalPropositional(premises, conclusions) {

    // Premises, conclusions
    for (premise of premises) {
        TreeProof.addLine(new Line(new LineContentSentence(premise), new justifications.JustPremise()));
    }
    for (conclusion of conclusions) {
        TreeProof.addLine(new Line(new LineContentSentence(new Sentence(operators.negation, conclusion)), new justifications.JustConclusion()));
    }

    while (!TreeProof.isComplete()) {

        // If we have a contradiction, close the active segment
        let activeSentences = [];
        for (line of TreeProof.getActiveLines()) {
            if (line.getLineContent().type === "sentence") {
                activeSentences.push(line.getLineContent().sentence);
            }
        }
        if (containsContradiction(activeSentences)) {
            TreeProof.closeActiveSegment();
            continue;
        }

        // Otherwise, see what rules we can apply!

        let usableLines = TreeProof.getUsableLines();
        let appliedRule = false;

        // First, non-splitting rules:
        // conjunctions, negated disjunctions, negated conditionals and double negations.
        for (let line of usableLines) {

            let content = line.getLineContent();
            if (content.type !== "sentence") {
                continue;
            }
            let sentence = content.sentence;

            // Conjunction?
            if (sentence.operator.isEqual(operators.conjunction)) {
                let left = new Line(new LineContentSentence(sentence.operands[0]), new justifications.JustExpConj(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new justifications.JustExpConj(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated disjunction?
            if (sentence.operator.isEqual(operators.negation) && sentence.operands[0].operator.isEqual(operators.disjunction)) {
                let left = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[0])), new justifications.JustExpDisj(line));
                let right = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[1])), new justifications.JustExpDisj(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated conditional?
            if (sentence.operator.isEqual(operators.negation) && hasEqualEntries(sentence.operands[0].operator, operators.conditional)) {
                let left = new Line(new LineContentSentence(sentence.operands[0].operands[0]), new justifications.JustExpCond(line));
                let right = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[1])), new justifications.JustExpCond(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Double negation?
            if (sentence.operator.isEqual(operators.negation) && hasEqualEntries(sentence.operands[0].operator, operators.negation)) {
                let newLine = new Line(new LineContentSentence(sentence.operands[0].operands[0]), new justifications.JustDNE(line));
                TreeProof.addLine(newLine);
                line.setUsed(newLine);
                appliedRule = true;
                continue;
            }

        }

        if (appliedRule) {
            continue;
        }

        // Now, splitting rules. One at a time!
        for (line of usableLines) {

            let content = line.getLineContent();
            if (content.type !== "sentence") {
                continue;
            }
            let sentence = content.sentence;

            // Conditional?
            if (sentence.operator.isEqual(operators.conditional)) {
                let left = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0])), new justifications.JustSplitCond(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new justifications.JustSplitCond(line));
                TreeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Disjunction?
            if (sentence.operator.isEqual(operators.disjunction)) {
                let left = new Line(new LineContentSentence(sentence.operands[0]), new justifications.JustSplitDisj(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new justifications.JustSplitDisj(line));
                TreeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Negated conjunction?
            if (sentence.operator.isEqual(operators.negation) && hasEqualEntries(sentence.operands[0].operator, operators.conjunction)) {
                let left = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[0])), new justifications.JustSplitConj(line));
                let right = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[1])), new justifications.JustSplitConj(line));
                TreeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

        }

        // If we can't do anything, the segment must be left open!
        if (!appliedRule) {
            TreeProof.leaveActiveSegmentOpen();
        }
    }

}

export function containsContradiction(sentences) {
    return sentences.some(sentence => sentence.operator.isEqual(operators.negation) && sentences.some(otherSentence => otherSentence.isEqual(sentence.operands[0])));
}

export function randomProof(sentences) {

    let lineContents = sentences.map(sentence => new LineContentSentence(sentence));
    let lines = [];

    // Generate a random proof (for testing purposes)

    function shouldWeSplit() {
        return Math.random() <= 1 / (1 + Math.sqrt(TreeProof.getLength()));
    }

    function shouldWeClose() {
        return Math.random() >= 1 / (Math.sqrt(TreeProof.getLength()));
    }

    function pickRandomItem(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function pickRandomJustification() {
        let justification = pickRandomItem(Object.values(justifications));
        return new justification(pickRandomItem(lines));
    }

    let firstLine = new Line(pickRandomItem(lineContents), new justifications.JustPremise());
    console.log(firstLine.getDisplayString());
    TreeProof.addLine(firstLine);
    lines.push(firstLine);
    while (!TreeProof.isComplete()) {

        if (TreeProof.getLength() > 100) {
            while (!TreeProof.isComplete()) {
                console.log("closing segment");
                TreeProof.closeActiveSegment();
            }
            continue;
        }

        if (shouldWeClose()) {
            console.log("closing segment");
            TreeProof.closeActiveSegment();
            continue;
        }

        if (shouldWeSplit()) {
            let leftLine = new Line(pickRandomItem(lineContents), pickRandomJustification());
            lines.push(leftLine);
            console.log("left: " + leftLine.getDisplayString());
            let rightLine = new Line(pickRandomItem(lineContents), pickRandomJustification());
            lines.push(rightLine);
            console.log("right: " + rightLine.getDisplayString());
            TreeProof.split([leftLine], [rightLine]);
            continue;
        }

        let line = new Line(pickRandomItem(lineContents), pickRandomJustification());
        console.log(line.getDisplayString());
        lines.push(line);
        TreeProof.addLine(line);
    }
}