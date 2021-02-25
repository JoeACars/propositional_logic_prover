///////////////////////////////////////////////
//////// PropositionalLogicProver.js //////////
///////////////////////////////////////////////

/// This file simply acts to pass on the relevant functions to the HTML file.

import {
    addLanguageOptions,
    onClickAddPremise,
    onClickAddConclusion,
    onClickValidateArgument
} from "./Input/Input.js";
export { insertExampleInput } from "./Input/Input.js";

const addPremiseButtonId = "addPremise";
const addConclusionButtonId = "addConclusion";
const validateArgumentButtonId = "validateArgument";

export function init() {
    document.getElementById(addPremiseButtonId).addEventListener("click", onClickAddPremise);
    document.getElementById(addConclusionButtonId).addEventListener("click", onClickAddConclusion);
    document.getElementById(validateArgumentButtonId).addEventListener("click", onClickValidateArgument);
    addLanguageOptions();
}