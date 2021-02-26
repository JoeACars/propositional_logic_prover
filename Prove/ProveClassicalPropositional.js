//////////////////////////////
////////// Prove.js //////////
//////////////////////////////

/// This file contains the functions for generating proofs in every implemented language.

"use strict";

import TreeProof from "../TreeProofs/TreeProof.js";
import justifications from "../TreeProofs/Justifications.js";
import { LineContentSentence } from "../TreeProofs/LineContent.js";
import Sentence from "../Syntax/Sentence.js";
import operators from "../Syntax/Operators.js";
import containsSententialContradiction from "./ContainsSententialContradiction.js";

const binaryOperators = [operators.conjunction, operators.disjunction, operators.conditional];

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
        if (containsSententialContradiction(treeProof.getActiveLines())) {
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

            // Expansion rules?
            if (tryExpansion(treeProof, line)) {
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

            if (trySplit(treeProof, line)) {
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

function tryExpansion(treeProof, line) {
    for (let operator of binaryOperators) {
        if (tryExpansionWithOp(treeProof, line, operator)) {
            return true;
        }
    }
    return false;
}

function tryExpansionWithOp(treeProof, line, operator) {

    let sentence = line.getLineContent().getSentence();


    // Does this sentence have to be negated or not for an expansion rule to apply?
    let negated = !operator.isEqual(operators.conjunction);
    let leftNegated = false;
    let rightNegated = false;
    
    // Is this sentence the right structure for an expansion rule?
    // If so, should the expanded lines be negated?
    if (negated) {
        // Have we got the right structure?
        if (!sentence.getOperand(0).getOperator().isEqual(operator)) {
            return false;
        }
        // Negated disjunction?
        if (operator.isEqual(operators.disjunction)) {
            leftNegated = true;
            rightNegated = true;
        }
        // Negated conditional?
        else if (operator.isEqual(operators.conditional)) {
            leftNegated = false;
            rightNegated = true;
        }
        else {
            throw new Error("Logic error in tryExpansionWithOp()");
        }
    }
    else {
        // Have we got the right structure?
        if (!sentence.getOperator().isEqual(operator)) {
            return false;
        }
        // Conjunction
        if (operator.isEqual(operators.conjunction)) {
            leftNegated = false;
            rightNegated = false;
        }
        else {
            throw new Error("Logic error in tryExpansionWithOp()");
        }
    }

    let Justification = justifications.getExpansion(operator);

    let unnegatedSentence = negated ? sentence.getOperand(0) : sentence;
    let left = treeProof.addNewLine(
        new LineContentSentence(leftNegated ? new Sentence(operators.negation, unnegatedSentence.getOperand(0)) : unnegatedSentence.getOperand(0)),
        new Justification(line));
    let right = treeProof.addNewLine(
        new LineContentSentence(rightNegated ? new Sentence(operators.negation, unnegatedSentence.getOperand(1)) : unnegatedSentence.getOperand(1)),
        new Justification(line));
    line.setUsed(left);
    line.setUsed(right);

    return true;
}

function trySplit(treeProof, line) {
    for (let operator of binaryOperators) {
        if (trySplitWithOp(treeProof, line, operator)) {
            return true;
        }
    }
    return false;
}

function trySplitWithOp(treeProof, line, operator) {

    let sentence = line.getLineContent().getSentence();


    // Does this sentence have to be negated or not for a splitting rule to apply?
    let negated = operator.isEqual(operators.conjunction);
    let leftNegated = false;
    let rightNegated = false;
    
    // Is this sentence the right structure for an expansion rule?
    // If so, should the expanded lines be negated?
    if (negated) {
        // Have we got the right structure?
        if (!sentence.getOperand(0).getOperator().isEqual(operator)) {
            return false;
        }
        // Negated conjunction
        if (operator.isEqual(operators.conjunction)) {
            leftNegated = true;
            rightNegated = true;
        }
        else {
            throw new Error("Logic error in tryExpansionWithOp()");
        }
    }
    else {
        // Have we got the right structure?
        if (!sentence.getOperator().isEqual(operator)) {
            return false;
        }
        // Disjunction?
        if (operator.isEqual(operators.disjunction)) {
            leftNegated = false;
            rightNegated = false;
        }
        // Conditional?
        else if (operator.isEqual(operators.conditional)) {
            leftNegated = true;
            rightNegated = false;
        }
        else {
            throw new Error("Logic error in tryExpansionWithOp()");
        }
    }

    let Justification = justifications.getSplit(operator);

    let unnegatedSentence = negated ? sentence.getOperand(0) : sentence;
    let [[left], [right]] = treeProof.splitWithNewLines(
        [ [ new LineContentSentence(leftNegated ? new Sentence(operators.negation, unnegatedSentence.getOperand(0)) : unnegatedSentence.getOperand(0)),
        new Justification(line) ] ],
        [ [ new LineContentSentence(rightNegated ? new Sentence(operators.negation, unnegatedSentence.getOperand(1)) : unnegatedSentence.getOperand(1)),
        new Justification(line) ] ]
    );
    line.setUsed(left);
    line.setUsed(right);

    return true;
}