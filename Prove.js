function proveClassicalPropositional(premises, conclusions) {

    // Premises, conclusions
    for (premise of premises) {
        Proof.addLine(new Line(new LineContentSentence(premise), new JustPremise()));
    }
    for (conclusion of conclusions) {
        Proof.addLine(new Line(new LineContentSentence(new Sentence(operatorNegation, conclusion)), new JustConclusion()));
    }

    while (!Proof.isComplete()) {

        // If we have a contradiction, close the active segment
        let activeSentences = [];
        for (line of Proof.getActiveLines()) {
            if (line.getLineContent().type === "sentence") {
                activeSentences.push(line.getLineContent().sentence);
            }
        }
        if (containsContradiction(activeSentences)) {
            Proof.closeActiveSegment();
            continue;
        }

        // Otherwise, see what rules we can apply!

        let usableLines = Proof.getUsableLines();
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
            if (hasEqualEntries(sentence.operator, operatorConjunction)) {
                let left = new Line(new LineContentSentence(sentence.operands[0]), new JustExpConj(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new JustExpConj(line));
                Proof.addLine(left);
                Proof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated disjunction?
            if (hasEqualEntries(sentence.operator, operatorNegation) && hasEqualEntries(sentence.operands[0].operator, operatorDisjunction)) {
                let left = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[0])), new JustExpDisj(line));
                let right = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[1])), new JustExpDisj(line));
                Proof.addLine(left);
                Proof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Negated conditional?
            if (hasEqualEntries(sentence.operator, operatorNegation) && hasEqualEntries(sentence.operands[0].operator, operatorConditional)) {
                let left = new Line(new LineContentSentence(sentence.operands[0].operands[0]), new JustExpCond(line));
                let right = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[1])), new JustExpCond(line));
                Proof.addLine(left);
                Proof.addLine(right);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                continue;
            }

            // Double negation?
            if (hasEqualEntries(sentence.operator, operatorNegation) && hasEqualEntries(sentence.operands[0].operator, operatorNegation)) {
                let newLine = new Line(new LineContentSentence(sentence.operands[0].operands[0]), new JustDNE(line));
                Proof.addLine(newLine);
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
            if (hasEqualEntries(sentence.operator, operatorConditional)) {
                let left = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0])), new JustSplitCond(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new JustSplitCond(line));
                Proof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Disjunction?
            if (hasEqualEntries(sentence.operator, operatorDisjunction)) {
                let left = new Line(new LineContentSentence(sentence.operands[0]), new JustSplitDisj(line));
                let right = new Line(new LineContentSentence(sentence.operands[1]), new JustSplitDisj(line));
                Proof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

            // Negated conjunction?
            if (hasEqualEntries(sentence.operator, operatorNegation) && hasEqualEntries(sentence.operands[0].operator, operatorConjunction)) {
                let left = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[0])), new JustSplitConj(line));
                let right = new Line(new LineContentSentence(new Sentence(operatorNegation, sentence.operands[0].operands[1])), new JustSplitConj(line));
                Proof.split([left], [right]);
                line.setUsed(left);
                line.setUsed(right);
                appliedRule = true;
                break;
            }

        }

        // If we can't do anything, the segment must be left open!
        if (!appliedRule) {
            Proof.leaveActiveSegmentOpen();
        }
    }

}

function containsContradiction(sentences) {
    return sentences.some(sentence => hasEqualEntries(sentence.operator, operatorNegation) && sentences.some(otherSentence => areSentencesEqual(sentence.operands[0], otherSentence)));
}