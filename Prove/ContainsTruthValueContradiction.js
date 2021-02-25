"use strict";

export default containsTruthValueContradiction(lines) {

    // Retrieve sentential line contents
    let contents = [];
    lines.forEach(line => {
        let content = line.getLineContent();
        if (content instanceof LineContentSentence) {
            contents.push(content);
        }
    });

    // Find truth value contradictions
    for (let content of contents) {
            if (content.getSentence().getOperator().isEqual(operators.negation)) {
                if (contents.some(otherContent => areContentsTruthValueContradictory(content, otherContent))) {
                    return true;
                }
            }
    }
    return false;
    
}

function areContentsTruthValueContradictory(content1, content2) {
    if (!(content1 instanceof LineContentSentence) || !(content2 instanceof LineContentSentence)) {
        return false;
    }
    if (content1.getWorld() !== content2.getWorld()) {
        return false;
    }
    if (!content1.getSentence().isEqual(content2.getSentence())) {
        return false;
    }
    return content1.getTruthValueMarker().contradicts(content2.getTruthValueMarker());
}