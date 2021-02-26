///////////////////////////////////////////////
//////// PropositionalLogicProver.js //////////
///////////////////////////////////////////////

/// This file simply acts to pass on the relevant functions to the HTML file.

import {
    addLanguageOptions,
    onClickAddPremise,
    onClickAddConclusion,
    onClickValidateArgument,
    insertExampleInput,
} from "./Input/Input.js";
import htmlElemIds from "./Input/HTMLElemIds.js";

function init() {
    document.getElementById(htmlElemIds.addPremiseButtonId).addEventListener("click", onClickAddPremise);
    document.getElementById(htmlElemIds.addConclusionButtonId).addEventListener("click", onClickAddConclusion);
    document.getElementById(htmlElemIds.validateArgumentButtonId).addEventListener("click", onClickValidateArgument);
    addLanguageOptions();
}

init();