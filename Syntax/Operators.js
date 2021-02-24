"use strict";

import Operator from "./Operator.js";

const displayNegation = "¬";
const displayConjunction = " ∧ ";
const displayDisjunction = " ∨ ";
const displayConditional = " → ";

const operators = {
    trivialOperator: new Operator("triv", 1),
    negation: new Operator("not", 1),
    conjunction: new Operator("and", 2),
    disjunction: new Operator("or", 2),
    conditional: new Operator("cond", 2),
    getDisplayString(op) {
        if (op.isEqual(operators.negation)) {
            return displayNegation;
        }
        if (op.isEqual(operators.conjunction)) {
            return displayConjunction;
        }
        if (op.isEqual(operators.disjunction)) {
            return displayDisjunction;
        }
        if (op.isEqual(operators.conditional)) {
            return displayConditional;
        }
        return "#OPERROR#";
    }
};
Object.freeze(operators);
export default operators;