"use strict";

import TreeProof from "../TreeProofs/TreeProof.js";
import Line from "../TreeProofs/Line.js";
import justifications from "../TreeProofs/Justifications.js";
import { LineContentSentence } from "../TreeProofs/LineContent.js";
import Sentence from "../Syntax/Sentence.js";
import operators from "../Syntax/Operators.js";
import containsTruthValueContradiction from "./ContainsTruthValueContradiction.js";
import truthValueMarkers from "../TreeProofs/TruthValueMarkers.js";

const binaryOperators = [operators.conjunction, operators.disjunction, operators.conditional];

export default function proveFDE(premises, conclusions) {
    
    let treeProof = new TreeProof();

    // Premises, conclusions
    for (let premise of premises) {
        treeProof.addNewLine(new LineContentSentence(premise, truthValueMarkers.isTrue), new justifications.Premise());
    }
    for (let conclusion of conclusions) {
        treeProof.addNewLine(new LineContentSentence(conclusion, truthValueMarkers.isNotTrue), new justifications.Conclusion());
    }

    // Apply rules!
    while (!treeProof.isComplete()) {

        // If we have a contradiction, close the active segment
        if (containsTruthValueContradiction(treeProof.getActiveLines())) {
            treeProof.closeActiveSegment();
            continue;
        }

        // Otherwise, see what rules we can apply!

        let usableLines = treeProof.getUsableLines();
        let appliedRule = false;

        // First, non-splitting rules:
        for (let line of usableLines) {

            let content = line.getLineContent();
            let sentence = content.getSentence();
            let truthValueMarker = content.getTruthValueMarker();

            // Expansion rules?
            if (tryExpansion(treeProof, line)) {
                appliedRule = true;
                continue;
            }

            // Negation elimination?
            if (sentence.getOperator().isEqual(operators.negation)) {
                let newLine = treeProof.addNewLine(new LineContentSentence(sentence.getOperand(0), truthValueMarker.flipTruthiness()), new justifications.NegationElim(line));
                line.setUsed(newLine);
                appliedRule = true;
                continue;
            }

        }
        
        // Keep doing non-splitting rules until we can't do any more...
        if (appliedRule) {
            continue;
        }

        // Now, splitting rules. One at a time!
        for (let line of usableLines) {

            if (trySplit(treeProof, line)) {
                appliedRule = true;
                continue;
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
    let truthValueMarker = line.getLineContent().getTruthValueMarker();

    // Got the right operator?
    if (!sentence.getOperator().isEqual(operator)) {
        return false;
    }

    // Is it a valid operator for expansion?
    if (!binaryOperators.includes(operator)) {
        return false;
    }

    // Does this sentence have to be truthy or falsy for an expansion rule to apply?
    let truthy = operator.isEqual(operators.conjunction);
    if ((truthy && truthValueMarker.isFalsy()) || (!truthy && truthValueMarker.isTruthy())) {
        return false;
    }

    let leftTruthValueMarker = !operator.isEqual(operators.conditional) ? truthValueMarker : truthValueMarker.flipTruthiness();
    let rightTruthValueMarker = truthValueMarker;
    let Justification = justifications.getExpansion(operator);

    let left = treeProof.addNewLine(new LineContentSentence(sentence.getOperand(0), leftTruthValueMarker), new Justification(line));
    let right = treeProof.addNewLine(new LineContentSentence(sentence.getOperand(1), rightTruthValueMarker), new Justification(line));
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
    let truthValueMarker = line.getLineContent().getTruthValueMarker();

    // Got the right operator?
    if (!sentence.getOperator().isEqual(operator)) {
        return false;
    }

    // Is it a valid operator for splitting?
    if (!binaryOperators.includes(operator)) {
        return false;
    }

    // Does this sentence have to be truthy or falsy for a splitting rule to apply?
    let truthy = !operator.isEqual(operators.conjunction);
    if ((truthy && truthValueMarker.isFalsy()) || (!truthy && truthValueMarker.isTruthy())) {
        return false;
    }

    let leftTruthValueMarker = !operator.isEqual(operators.conditional) ? truthValueMarker : truthValueMarker.flipTruthiness();
    let rightTruthValueMarker = truthValueMarker;
    let Justification = justifications.getSplit(operator);

    let [ [left], [right] ] = treeProof.splitWithNewLines(
        [ [ new LineContentSentence(sentence.getOperand(0), leftTruthValueMarker), new Justification(line) ] ],
        [ [ new LineContentSentence(sentence.getOperand(1), rightTruthValueMarker), new Justification(line) ] ]
    );
    line.setUsed(left);
    line.setUsed(right);

    return true;
}