"use strict";

const negationCodes = ["not", "neg", "negation", "!", "¬", "~", "-"];
const conjunctionCodes = ["and", "con", "conj", "conjunct", "conjunction", "+", "&", "^"];
const disjunctionCodes = ["or", "dis", "disj", "disjunct", "disjunction", "v", "/"];
const conditionalCodes = ["if", "then", "to", "imply", "implies", "->", ">", "sup", "supset", "entail", "entails", "require", "requires", "cond", "conditional", "arrow", "rightarrow", "rarrow"];

const sentenceLetterCodes = ["p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
const sentenceLetters = new Map(sentenceLetterCodes.map(char => [char, new Sentence(trivialOperator, char)]));

const displayNegation = "¬";
const displayConjunction = " ∧ ";
const displayDisjunction = " ∨ ";
const displayConditional = " → ";

const languageClassical = "classical";
let language = languageClassical;

/// Translates an input code into an operator. If the input
/// doesn't match any recognised code, returns null.
/// If no or invalid operatorType is provided, tries all operator types.
/// operatorType may be "negation", "conjunction", "disjunction" or "conditional".
function translateOperatorCode(code, operatorType) {

    let checkNegation = (operatorType === "negation");
    let checkConjunction = (operatorType === "conjunction");
    let checkDisjunction = (operatorType === "disjunction");
    let checkConditional = (operatorType === "conditional");
    if (!checkNegation && !checkConjunction && !checkDisjunction && !checkConditional) {
        checkNegation = checkConjunction = checkDisjunction = checkConditional = true;
    }

    if (checkNegation && (negationCodes.indexOf(code) !== -1)) {
        return operatorNegation;
    }
    else if (checkConjunction && (conjunctionCodes.indexOf(code) !== -1)) {
        return operatorConjunction;
    }
    else if (checkDisjunction && (disjunctionCodes.indexOf(code) !== -1)) {
        return operatorDisjunction;
    }
    else if (checkConditional && (conditionalCodes.indexOf(code) !== -1)) {
        return operatorConditional;
    }
    return null;
}

/// Finds whether the given string starting at the given index matches the search term or not.
function stringMatchesAt(str, start, search) {
    try {
        if (str.length - start < str.search) {
            return false;
        }
        return str.slice(start, start + search.length) === search;
    }
    catch {
        return false;
    }
}

/// Searches for a sentence-letter code in the provided string, at the specified start
/// index. If a sentence-letter is found, returns {code, sent}, where code is the code
/// found and sent is the sentence letter the code translates to. Otherwise, returns null.
function parseSentenceLetter(str, start) {

    for (let code of sentenceLetterCodes) {
        if (stringMatchesAt(str, start, code)) {
            return { code, sent: sentenceLetters.get(code) };
        }
    }

    return null;
}

/// Searches for an operator code in the provided string, at the specified start index.
/// If an operator is found, returns {code, op}, where code is the code found and op
/// is the operator the code translates to. Otherwise, returns null.
function parseOperator(str, start) {

    str = str.toLowerCase();

    for (let code of negationCodes) {
        if (stringMatchesAt(str, start, code)) {
            return { code, op: translateOperatorCode(code, "negation") };
        }
    }

    for (let code of conjunctionCodes) {
        if (stringMatchesAt(str, start, code)) {
            return { code, op: translateOperatorCode(code, "conjunction") };
        }
    }

    for (let code of disjunctionCodes) {
        if (stringMatchesAt(str, start, code)) {
            return { code, op: translateOperatorCode(code, "disjunction") };
        }
    }

    for (let code of conditionalCodes) {
        if (stringMatchesAt(str, start, code)) {
            return { code, op: translateOperatorCode(code, "conditional") };
        }
    }

    return null;

}

/// Searches for a bracketed expression in the provided string, at the specified start index.
/// If an operator is found, returns the expression (string) with the outer brackets
/// trimmed off. If no bracketed expression was found, returns null.
function parseBracketedExpression(str, start) {

    if (str[start] !== "(") {
        return null;
    }

    let close = start + 1;

    for (let numOpenBrackets = 1; numOpenBrackets > 0; close++) {

        if (close >= str.length) {
            return null;
        }

        else if (str[close] === "(") {
            numOpenBrackets++;
        }

        else if (str[close] === ")") {
            numOpenBrackets--;
        }
    }
    close--;

    return str.slice(start + 1, close);

}

/// Splits the provided string into (possibly bracketed) expressions and operators,
/// returning the sequence of sentence-letters, bracketed expressions (strings) and operators
/// in an array of { type, val } where type is either "sent" (sentence-letter), "expr"
/// (bracketed expression) or "op" (operator), and val is the value. If the input couldn't
/// be split in this way, returns null.
function splitExpression(str) {

    str = String(str);
    let splitExpr = [];

    let startIndex = 0;
    while (startIndex < str.length) {

        // Ignore whitespace
        if (str[startIndex].trim() === "") {
            startIndex++;
            continue;
        }

        // First, check for operators.
        let opResult = parseOperator(str, startIndex);
        if (opResult !== null) {
            splitExpr.push({ type: "op", val: opResult.op });
            startIndex += opResult.code.length;
            continue;
        }

        // Next, check for lone sentence-letters.
        let sentResult = parseSentenceLetter(str, startIndex);
        if (sentResult !== null) {
            splitExpr.push({ type: "sent", val: sentResult.sent });
            startIndex += sentResult.code.length;
            continue;
        }

        // Finally, try and find a bracketed expression.
        let bracketedExpr = parseBracketedExpression(str, startIndex);
        if (bracketedExpr !== null) {
            splitExpr.push({ type: "expr", val: bracketedExpr });
            startIndex += bracketedExpr.length + 2;
            continue;
        }

        return null;

    }

    return splitExpr;

}

/// Tries to parse the given split expression into a Sentence by means
/// of the given binary operation. By default, searches left-to-right.
/// If successful, returns the parsed Sentence. Otherwise returns null.
function parseSplitExprByBinaryOp(splitExpr, op, ltr = true) {
    let step = ltr ? 1 : -1;
    let start = ltr ? 1 : splitExpr.length - 1;
    let end = ltr ? splitExpr.length : 0;
    for (let exprIndex = start; exprIndex != end; exprIndex += step) {
        if (splitExpr[exprIndex].type === "op" && op.isEqual(splitExpr[exprIndex].val)) {
            return new Sentence(op, parseSplitExpr(splitExpr.slice(0, exprIndex)), parseSplitExpr(splitExpr.slice(exprIndex + 1)));
        }
    }
    return null;
}

/// Tries to parse the given split expression into a Sentence.
/// If successful, returns the Sentence.
/// Otherwise, returns null.
function parseSplitExpr(splitExpr) {

    // First, is it just a sentence-letter or bracketed expression?
    if (splitExpr.length === 1) {
        if (splitExpr[0].type === "sent") {
            return splitExpr[0].val;
        }
        else if (splitExpr[0].type === "expr") {
            return parseSplitExpr(splitExpression(splitExpr[0].val));
        }
        else {
            return null;
        }
    }

    // Then conjunctions, left-to-right
    let parseByConj = parseSplitExprByBinaryOp(splitExpr, operatorConjunction);
    if (parseByConj !== null) {
        return parseByConj;
    }

    // Then disjunctions, left-to-right
    let parseByDisj = parseSplitExprByBinaryOp(splitExpr, operatorDisjunction);
    if (parseByDisj !== null) {
        return parseByDisj;
    }

    // Then conditionals, right-to-left
    let parseByCond = parseSplitExprByBinaryOp(splitExpr, operatorConditional, false);
    if (parseByCond !== null) {
        return parseByCond;
    }

    // Then negation
    if (splitExpr[0].type === "op" && operatorNegation.isEqual(splitExpr[0].val)) {
        return new Sentence(operatorNegation, parseSplitExpr(splitExpr.slice(1)));
    }

    return null;

}

/// Tries to parse the given string into a Sentence.
/// If successful, returns the Sentence.
/// Otherwise, returns null.
function parseSentence(str) {

    // Trim whitespace
    str = str.trim();

    // Ensure lower-case
    str = str.toLowerCase();

    // Split up into expressions and operators
    let splitExpr = splitExpression(str);
    if (splitExpr === null || splitExpr.length === 0) {
        return null;
    }

    return parseSplitExpr(splitExpr);

}

function validateArgument() {

    language = document.getElementById("language").value;

    // Retrieve premises and conclusions

    let premises = [];
    for (let index = 1, premiseInput = document.getElementById(getInputId(true, index));
        premiseInput !== null;
        premiseInput = document.getElementById(getInputId(true, index))) {
        let premise = parseSentence(premiseInput.value);
        if (premise === null) {
            alert("Error! Invalid premise input.");
            return;
        }
        premises.push(premise);
        index++;
    }

    let conclusions = [];
    for (let index = 1, conclusionInput = document.getElementById(getInputId(false, index));
        conclusionInput !== null;
        conclusionInput = document.getElementById(getInputId(false, index))) {
        let conclusion = parseSentence(conclusionInput.value);
        if (conclusion === null) {
            alert("Error! Invalid conclusion input.");
            return;
        }
        conclusions.push(conclusion);
        index++;
    }

    if (language === languageClassical) {
        proveClassicalPropositional(premises, conclusions);
    }

    let offsetLeft = 20;
    let offsetTop = 400;
    TreeProof.display(offsetLeft, offsetTop);
    displayValidityResult(offsetLeft, offsetTop - lineHeight);
    padProof();
}

function randomProof(sentences) {

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
        let justification = pickRandomItem([JustExpCond, JustExpConj, JustExpDisj, JustSplitCond, JustSplitConj, JustSplitDisj]);
        return new justification(pickRandomItem(lines));
    }

    let firstLine = new Line(pickRandomItem(lineContents), new JustPremise());
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
