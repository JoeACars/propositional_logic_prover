//////////////////////////////
////////// Prove.js //////////
//////////////////////////////

/// This file contains the functions for generating proofs in every implemented language.

"use strict";

import TreeProof from "../TreeProofs/TreeProof.js";
import Line from "../TreeProofs/Line.js";
import justifications from "../TreeProofs/Justifications.js";
import { LineContentSentence } from "../TreeProofs/LineContent.js";
import Sentence from "../Syntax/Sentence.js";
import operators from "../Syntax/Operators.js";
import containsContradiction from "./ContainsContradiction.js";

export default function proveClassicalPropositional(premises, conclusions) {

    let treeProof = new TreeProof();

    // Premises, conclusions
    for (let premise of premises) {
        treeProof.addNewLine(new LineContentSentence(premise), new justifications.Premise());
    }
    for (let conclusion of conclusions) {
        treeProof.addNewLine(new LineContentSentence(new Sentence(operators.negation, conclusion)), new justifications.Conclusion());
    }

    while (!treeProof.isComplete()) {

        // If we have a contradiction, close the active segment
        let activeSentences = [];
        for (let line of treeProof.getActiveLines()) {
            if (line.getLineContent() instanceof LineContentSentence) {
                activeSentences.push(line.getLineContent().getSentence());
            }
        }
        if (containsContradiction(activeSentences)) {
            treeProof.closeActiveSegment();
            continue;
        }

        // Otherwise, see what rules we can apply!

        let usableLines = treeProof.getUsableLines();
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
                let left = treeProof.addNewLine(new LineContentSentence(sentence.getOperand(0)), new justifications.ExpandConj(line));
                let right = treeProof.addNewLine(new LineContentSentence(sentence.getOperand(1)), new justifications.ExpandConj(line));
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated disjunction?
            if (sentence.getOperator().isEqual(operators.negation) && sentence.getOperand(0).getOperator().isEqual(operators.disjunction)) {
                let left = treeProof.addNewLine(new LineContentSentence(new Sentence(operators.negation, sentence.getOperand(0).getOperand(0))), new justifications.ExpandDisj(line));
                let right = treeProof.addNewLine(new LineContentSentence(new Sentence(operators.negation, sentence.getOperand(0).getOperand(1))), new justifications.ExpandDisj(line));
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated conditional?
            if (sentence.getOperator().isEqual(operators.negation) && operators.conditional.isEqual(sentence.getOperand(0).getOperator())) {
                let left = treeProof.addNewLine(new LineContentSentence(sentence.getOperand(0).getOperand(0)), new justifications.ExpandCond(line));
                let right = treeProof.addNewLine(new LineContentSentence(new Sentence(operators.negation, sentence.getOperand(0).getOperand(1))), new justifications.ExpandCond(line));
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Double negation?
            if (sentence.getOperator().isEqual(operators.negation) && operators.negation.isEqual(sentence.getOperand(0).getOperator())) {
                let newLine = treeProof.addNewLine(new LineContentSentence(sentence.getOperand(0).getOperand(0)), new justifications.DoubleNegationElim(line));
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
            if (!(content instanceof LineContentSentence)) {
                continue;
            }
            let sentence = content.getSentence();

            // Conditional?
            if (sentence.getOperator().isEqual(operators.conditional)) {
                let left = new Line(treeProof.getLength() + 1, new LineContentSentence(new Sentence(operators.negation, sentence.getOperand(0))), new justifications.SplitCond(line));
                let right = new Line(treeProof.getLength() + 1, new LineContentSentence(sentence.getOperand(1)), new justifications.SplitCond(line));
                treeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Disjunction?
            if (sentence.getOperator().isEqual(operators.disjunction)) {
                let left = new Line(treeProof.getLength() + 1, new LineContentSentence(sentence.getOperand(0)), new justifications.SplitDisj(line));
                let right = new Line(treeProof.getLength() + 1, new LineContentSentence(sentence.getOperand(1)), new justifications.SplitDisj(line));
                treeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Negated conjunction?
            if (sentence.getOperator().isEqual(operators.negation) && operators.conjunction.isEqual(sentence.getOperand(0).getOperator())) {
                let left = new Line(treeProof.getLength() + 1, new LineContentSentence(new Sentence(operators.negation, sentence.getOperand(0).getOperand(0))), new justifications.SplitConj(line));
                let right = new Line(treeProof.getLength() + 1, new LineContentSentence(new Sentence(operators.negation, sentence.getOperand(0).getOperand(1))), new justifications.SplitConj(line));
                treeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

        }

        // If we can't do anything, the segment must be left open!
        if (!appliedRule) {
            treeProof.leaveActiveSegmentOpen();
        }
    }
    
    return treeProof;

}