//////////////////////////////
////////// Prove.js //////////
//////////////////////////////

/// This file contains the functions for generating proofs in every implemented language.

"use strict";

import TreeProof from "./TreeProofs/TreeProof.js";
import Line from "./TreeProofs/Line.js";
import justifications from "./TreeProofs/Justifications.js";
import { LineContentSentence } from "./TreeProofs/LineContent.js";
import Sentence from "./Syntax/Sentence.js";
import operators from "./Syntax/Operators.js";

export { TreeProof };

export function proveClassicalPropositional(premises, conclusions) {

    // Premises, conclusions
    for (let premise of premises) {
        TreeProof.addLine(new Line(new LineContentSentence(premise), new justifications.Premise()));
    }
    for (let conclusion of conclusions) {
        TreeProof.addLine(new Line(new LineContentSentence(new Sentence(operators.negation, conclusion)), new justifications.Conclusion()));
    }

    while (!TreeProof.isComplete()) {

        // If we have a contradiction, close the active segment
        let activeSentences = [];
        for (let line of TreeProof.getActiveLines()) {
            if (line.getLineContent() instanceof LineContentSentence) {
                activeSentences.push(line.getLineContent().getSentence());
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
            if (!(content instanceof LineContentSentence)) {
                continue;
            }
            let sentence = content.getSentence();

            // Conjunction?
            if (sentence.getOperator().isEqual(operators.conjunction)) {
                let left = new Line(new LineContentSentence(sentence.operands[0]), new justifications.ExpandConj(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new justifications.ExpandConj(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated disjunction?
            if (sentence.getOperator().isEqual(operators.negation) && sentence.operands[0].getOperator().isEqual(operators.disjunction)) {
                let left = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[0])), new justifications.ExpandDisj(line));
                let right = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[1])), new justifications.ExpandDisj(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated conditional?
            if (sentence.getOperator().isEqual(operators.negation) && hasEqualEntries(sentence.operands[0].getOperator(), operators.conditional)) {
                let left = new Line(new LineContentSentence(sentence.operands[0].operands[0]), new justifications.ExpandCond(line));
                let right = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[1])), new justifications.ExpandCond(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Double negation?
            if (sentence.getOperator().isEqual(operators.negation) && hasEqualEntries(sentence.operands[0].getOperator(), operators.negation)) {
                let newLine = new Line(new LineContentSentence(sentence.operands[0].operands[0]), new justifications.DoubleNegationElim(line));
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
        for (let line of usableLines) {

            let content = line.getLineContent();
            if (content instanceof LineContentSentence) {
                continue;
            }
            let sentence = content.getSentence();

            // Conditional?
            if (sentence.getOperator().isEqual(operators.conditional)) {
                let left = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0])), new justifications.SplitCond(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new justifications.SplitCond(line));
                TreeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Disjunction?
            if (sentence.getOperator().isEqual(operators.disjunction)) {
                let left = new Line(new LineContentSentence(sentence.operands[0]), new justifications.SplitDisj(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new justifications.SplitDisj(line));
                TreeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Negated conjunction?
            if (sentence.getOperator().isEqual(operators.negation) && hasEqualEntries(sentence.operands[0].getOperator(), operators.conjunction)) {
                let left = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[0])), new justifications.SplitConj(line));
                let right = new Line(new LineContentSentence(new Sentence(operators.negation, sentence.operands[0].operands[1])), new justifications.SplitConj(line));
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
    
    return TreeProof;

}

function containsContradiction(sentences) {
    return sentences.some(sentence => sentence.getOperator().isEqual(operators.negation) && sentences.some(otherSentence => otherSentence.isEqual(sentence.operands[0])));
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

    let firstLine = new Line(pickRandomItem(lineContents), new justifications.Premise());
    console.log(operators.getDisplayString(operatorsfirstLine));
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