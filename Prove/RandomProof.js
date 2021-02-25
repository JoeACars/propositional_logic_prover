"use strict";

import TreeProof from "../TreeProofs/TreeProof.js";
import { LineContentSentence } from "../TreeProofs/LineContent";
import justifications from "../TreeProofs/Justifications.js";

export default function randomProof(sentences) {

    let lineContents = sentences.map(sentence => new LineContentSentence(sentence));
    let lines = [];
    let treeProof = new TreeProof();

    // Generate a random proof (for testing purposes)

    function shouldWeSplit() {
        return Math.random() <= 1 / (1 + Math.sqrt(treeProof.getLength()));
    }

    function shouldWeClose() {
        return Math.random() >= 1 / (Math.sqrt(treeProof.getLength()));
    }

    function pickRandomItem(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function pickRandomJustification() {
        let justification = pickRandomItem(Object.values(justifications));
        return new justification(pickRandomItem(lines));
    }

    lines.push(treeProof.addNewLine(pickRandomItem(lineContents), new justifications.Premise()));
    while (!treeProof.isComplete()) {

        if (treeProof.getLength() > 100) {
            while (!treeProof.isComplete()) {
                console.log("closing segment");
                treeProof.closeActiveSegment();
            }
            continue;
        }

        if (shouldWeClose()) {
            console.log("closing segment");
            treeProof.closeActiveSegment();
            continue;
        }

        if (shouldWeSplit()) {
            let leftLine = treeProof.addNewLine(pickRandomItem(lineContents), pickRandomJustification());
            lines.push(leftLine);
            let rightLine = treeProof.addNewLine(pickRandomItem(lineContents), pickRandomJustification());
            lines.push(rightLine);
            treeProof.split([leftLine], [rightLine]);
            continue;
        }

        let line = treeProof.addNewLine(pickRandomItem(lineContents), pickRandomJustification());
        console.log(line.getDisplayString());
        lines.push(line);
    }

    return treeProof;
}