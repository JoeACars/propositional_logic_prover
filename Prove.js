function proveClassicalPropositional(premises, conclusions) {

    // Premises, conclusions
    for (premise of premises) {
        TreeProof.addLine(new Line(new LineContentSentence(premise), new JustPremise()));
    }
    for (conclusion of conclusions) {
        TreeProof.addLine(new Line(new LineContentSentence(new Sentence(operatorNegation, conclusion)), new JustConclusion()));
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
            if (sentence.operator.isEqual(operatorConjunction)) {
                let left = new Line(new LineContentSentence(sentence.operands[0]), new JustExpConj(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new JustExpConj(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated disjunction?
            if (sentence.operator.isEqual(operatorNegation) && sentence.operands[0].operator.isEqual(operatorDisjunction)) {
                let left = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[0])), new JustExpDisj(line));
                let right = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[1])), new JustExpDisj(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated conditional?
            if (sentence.operator.isEqual(operatorNegation) && hasEqualEntries(sentence.operands[0].operator, operatorConditional)) {
                let left = new Line(new LineContentSentence(sentence.operands[0].operands[0]), new JustExpCond(line));
                let right = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[1])), new JustExpCond(line));
                TreeProof.addLine(left);
                TreeProof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Double negation?
            if (sentence.operator.isEqual(operatorNegation) && hasEqualEntries(sentence.operands[0].operator, operatorNegation)) {
                let newLine = new Line(new LineContentSentence(sentence.operands[0].operands[0]), new JustDNE(line));
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
            if (sentence.operator.isEqual(operatorConditional)) {
                let left = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0])), new JustSplitCond(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new JustSplitCond(line));
                TreeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Disjunction?
            if (sentence.operator.isEqual(operatorDisjunction)) {
                let left = new Line(new LineContentSentence(sentence.operands[0]), new JustSplitDisj(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new JustSplitDisj(line));
                TreeProof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Negated conjunction?
            if (sentence.operator.isEqual(operatorNegation) && hasEqualEntries(sentence.operands[0].operator, operatorConjunction)) {
                let left = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[0])), new JustSplitConj(line));
                let right = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[1])), new JustSplitConj(line));
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

function containsContradiction(sentences) {
    return sentences.some(sentence => sentence.operator.isEqual(operatorNegation) && sentences.some(otherSentence => otherSentence.isEqual(sentence.operands[0])));
}