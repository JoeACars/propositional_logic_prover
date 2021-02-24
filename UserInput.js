////////////////////////////////
///////// UserInput.js /////////
////////////////////////////////

/// This file contains everything relating to user input.


"use strict";

let numPremises = 0;
let numConclusions = 0;
let languageSelectId = "language";
let premiseListId = "premises";
let conclusionListId = "conclusions";
let validityResultId = "validityResult";
let proofTitleId = "proofTitle";
let proofListId = "proof";

function Language(id, disp) {
    this.id = id;
    this.disp = disp;
}
const languageClassical = new Language("classical", "Classical Propositional Logic");
const languageDefault = languageClassical;
const languages = [languageClassical];

/// Called when the user presses the "Validate Argument" button.
/// Retrieves the user inputs, tries to parse them, and if
/// successful, generates a proof.
export function validateArgument() {

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

/// Adds the options for the implemented languages to the user's dropdown.
export function addLanguageOptions(dropdownId) {
    let dropdown = document.getElementById(dropdownId);
    for (language of languages) {
        let option = document.createElement("option");
        option.value = language.id;
        option.innerHTML = language.disp;
        if (language === languageDefault) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    }
}

function getArrowOnClickText(up) {
    return "onArrowClick(" + String(up) + ", this.id)";
}

function getRemoveOnClickText() {
    return "onRemoveClick(this.id)";
}

function getPremiseId(number) {
    if (number === +number && number % 1 === 0) {
        return "Premise" + String(number);
    }
}

function getConclusionId(number) {
    if (number === +number && number % 1 === 0) {
        return "Conclusion" + String(number);
    }
}

function getArrowId(isPremise, up, number) {
    return "arrow" + (up ? "Up" : "Down") + (isPremise ? getPremiseId(number) : getConclusionId(number));
}

function getRemoveId(isPremise, number) {
    return "remove" + (isPremise ? getPremiseId(number) : getConclusionId(number));
}

function getItemId(isPremise, number) {
    return "item" + (isPremise ? getPremiseId(number) : getConclusionId(number));
}

function getLabelId(isPremise, number) {
    return "label" + (isPremise ? getPremiseId(number) : getConclusionId(number));
}

function getInputId(isPremise, number) {
    return "input" + (isPremise ? getPremiseId(number) : getConclusionId(number));
}

function getLabelValue(isPremise, number) {
    return (isPremise ? "Premise " : "Conclusion ") + String(number) + " :";
}

function makeArrowButton(isPremise, up, number) {
    let arrow = document.createElement("img");
    let direction = up ? "Up" : "Down";
    arrow.setAttribute("id", getArrowId(isPremise, up, number));
    arrow.setAttribute("src", direction.toLowerCase() + "arrow.png");
    arrow.setAttribute("alt", "Move " + direction);
    arrow.setAttribute("title", "Move " + direction);
    arrow.setAttribute("height", "18");
    arrow.setAttribute("width", "18");
    arrow.setAttribute("onclick", getArrowOnClickText(up));
    return arrow;
}

function makeRemoveButton(isPremise, number) {
    let remove = document.createElement("img");
    remove.setAttribute("id", getRemoveId(isPremise, number));
    remove.setAttribute("src", "delete.png");
    remove.setAttribute("alt", "Remove");
    remove.setAttribute("title", "Remove");
    remove.setAttribute("height", "18");
    remove.setAttribute("width", "18");
    remove.setAttribute("onclick", getRemoveOnClickText());
    return remove;
}

/// Extracts a number from the end of a string. e.g. "2 take 3.5 is -1.5" returns 1.5.
function getNumberFromEnd(str) {
    let number = "";
    let hasDecimalPoint = false;
    for (let index = str.length - 1; index >= 0; index--) {
        let char = str[index];
        if (char === ".") {
            if (hasDecimalPoint) {
                break;
            }
            number = char + number;
            hasDecimalPoint = true;
            continue;
        }
        if (char === "-") {
            number = char + number;
            break;
        }
        if (isNaN(+char)) {
            break;
        }
        number = char + number;
    }
    return +number;
}

export function onArrowClick(up, arrowElementId) {

    up = Boolean(up);
    arrowElementId = String(arrowElementId);

    let numberOfItemClicked = getNumberFromEnd(arrowElementId);
    let isPremise = arrowElementId.endsWith(getPremiseId(numberOfItemClicked));

    let thisInput = document.getElementById(getInputId(isPremise, numberOfItemClicked));
    let otherNumber = numberOfItemClicked + (up ? -1 : 1);
    let otherInput = document.getElementById(getInputId(isPremise, otherNumber));

    let thisValue = thisInput.value;
    thisInput.value = otherInput.value;
    otherInput.value = thisValue;
}

export function onRemoveClick(removeElementId) {

    removeElementId = String(removeElementId);

    let numberOfItemClicked = getNumberFromEnd(removeElementId);
    let isPremise = removeElementId.endsWith(getPremiseId(numberOfItemClicked));
    if (!isPremise && !removeElementId.endsWith(getConclusionId(numberOfItemClicked))) {
        window.alert("Error - Invalid call from a remove button!");
        return;
    }

    let item = document.getElementById(getItemId(isPremise, numberOfItemClicked));
    document.getElementById(isPremise ? premiseListId : conclusionListId).removeChild(item);

    let maxItemIndex;
    if (isPremise) {
        maxItemIndex = numPremises;
        numPremises--;
    }
    else {
        maxItemIndex = numConclusions;
        numConclusions--;
    }
    if (maxItemIndex === numberOfItemClicked) {
        maxItemIndex -= 1;
    }

    for (let index = numberOfItemClicked + 1; index <= maxItemIndex; index++) {
        document.getElementById(getItemId(isPremise, index)).setAttribute("id", getItemId(isPremise, index - 1));
        document.getElementById(getLabelId(isPremise, index)).innerHTML = getLabelValue(isPremise, index - 1);
        document.getElementById(getLabelId(isPremise, index)).setAttribute("id", getLabelId(isPremise, index - 1));
        document.getElementById(getInputId(isPremise, index)).setAttribute("id", getInputId(isPremise, index - 1));
        document.getElementById(getArrowId(isPremise, true, index)).setAttribute("id", getArrowId(isPremise, true, index - 1));
        document.getElementById(getArrowId(isPremise, false, index)).setAttribute("id", getArrowId(isPremise, false, index - 1));
        document.getElementById(getRemoveId(isPremise, index)).setAttribute("id", getRemoveId(isPremise, index - 1));
    }

    maxItemIndex = isPremise ? numPremises : numConclusions;

    if (maxItemIndex === 1) {
        disableArrow(document.getElementById(getArrowId(isPremise, true, 1)), true);
    }
    else if (maxItemIndex > 0) {
        disableArrow(document.getElementById(getArrowId(isPremise, false, maxItemIndex)), false);
    }
}

function addInputItem(isPremise) {

    isPremise = Boolean(isPremise);

    let itemNumber;
    if (isPremise) {
        numPremises++;
        itemNumber = numPremises;
    }
    else {
        numConclusions++;
        itemNumber = numConclusions; 
    }

    let item = document.createElement("item");
    item.setAttribute("id", getItemId(isPremise, itemNumber));

    let itemLabel = document.createElement("p");
    itemLabel.setAttribute("id", getLabelId(isPremise, itemNumber));
    itemLabel.setAttribute("for", getInputId(isPremise, itemNumber));
    itemLabel.style.display = "inline";
    itemLabel.innerHTML = getLabelValue(isPremise, itemNumber);

    let itemInput = document.createElement("input");
    itemInput.setAttribute("id", getInputId(isPremise, itemNumber));
    itemInput.setAttribute("type", "text");
    itemInput.setAttribute("size", "64");
    itemInput.style.position = "absolute";
    itemInput.style.left = "145px";

    let moveUp = makeArrowButton(isPremise, true, itemNumber);
    let moveDown = makeArrowButton(isPremise, false, itemNumber);
    let remove = makeRemoveButton(isPremise, itemNumber);
    moveUp.style.position = "absolute";
    moveDown.style.position = "absolute";
    remove.style.position = "absolute";
    moveUp.style.left = "615px";
    moveDown.style.left = "635px";
    remove.style.left = "655px";

    disableArrow(moveDown, false);
    if (itemNumber === 1) {
        disableArrow(moveUp, true);
    }
    else {
        let prevArrowDown = document.getElementById(getArrowId(isPremise, false, itemNumber - 1));
        enableArrow(prevArrowDown, false, getArrowOnClickText(false));
    }

    let br1 = document.createElement("br");
    let br2 = document.createElement("br");

    item.appendChild(itemLabel);
    item.appendChild(itemInput);
    item.appendChild(moveUp);
    item.appendChild(moveDown);
    item.appendChild(remove);
    item.appendChild(br1);
    item.appendChild(br2);
    if (isPremise) {
        document.getElementById(premiseListId).appendChild(item);
    }
    else {
        document.getElementById(conclusionListId).appendChild(item);
    }
}

function disableArrow(arrowElement, up) {
    arrowElement.setAttribute("src", (up ? "up" : "down") + "arrowdisabled.png");
    arrowElement.setAttribute("onclick", "");
}

function enableArrow(arrowElement, up, onclick) {
    arrowElement.setAttribute("src", (up ? "up" : "down") + "arrow.png");
    arrowElement.setAttribute("onclick", onclick);
}

export function insertExampleInput() {
    addInputItem(true);
    addInputItem(true);
    addInputItem(true);
    document.getElementById(getInputId(true, 1)).value = "p to (q to not r)";
    document.getElementById(getInputId(true, 2)).value = "not (r to not q)";
    document.getElementById(getInputId(true, 3)).value = "(s and t) or (not p or u)";
    addInputItem(false);
    addInputItem(false);
    addInputItem(false);
    document.getElementById(getInputId(false, 1)).value = "not (r and not r) to (not p to p)";
    document.getElementById(getInputId(false, 2)).value = "p to ((q and not q) to p)";
    document.getElementById(getInputId(false, 3)).value = "not not not (s to not t)";
}