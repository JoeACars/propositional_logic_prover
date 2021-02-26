"use strict";

import operators from "../Syntax/Operators.js";

/// Makes a new justification class with the given name, short display string and length, i.e. number of arguments.
function Justification(name, disp, length) {

    let justification = class {

        static _length;
        static _name;
        static _disp;

        constructor(...args) {
            if (args.length !== justification._length) {
                return;
            }
            this._args = args;
        }

        getName() {
            return justification._name;
        }

        getArgument(index) {
            return this._args[index];
        }

        getDisplayString() {

            let displayStr = "(";

            if (justification._disp && justification._disp !== "") {
                displayStr += justification._disp + ", ";
            }

            for (let arg of this._args) {
                displayStr += String(arg.getLineNumber()) + ", ";
            }

            if (displayStr === "(") {
                return "";
            }
            displayStr = displayStr.slice(0, displayStr.length - 2) + ")";

            return displayStr;
        }
    };
    justification._length = length;
    justification._name = name;
    justification._disp = disp;

    return justification;
};

/// List of justifications
const justifications = {
    Premise: Justification("premise", "pr", 0),
    Conclusion: Justification("conclusion", "c", 0),
    NegationElim: Justification("negation elimination", "", 1),
    DoubleNegationElim: Justification("double negation elimination", "", 1),
    SplitDisj: Justification("disjunctive split by cases", "", 1),
    SplitCond: Justification("conditional split by cases", "", 1),
    SplitConj: Justification("conjunctive split by cases", "", 1),
    ExpandDisj: Justification("disjunctive expansion", "", 1),
    ExpandConj: Justification("conjunctive expansion", "", 1),
    ExpandCond: Justification("conditional expansion", "", 1),
    getSplit(op) {
        if (operators.conjunction.isEqual(op)) {
            return this.SplitConj;
        }
        if (operators.disjunction.isEqual(op)) {
            return this.SplitDisj;
        }
        if (operators.conditional.isEqual(op)) {
            return this.SplitCond;
        }
        return null;
    },
    getExpansion(op) {
        if (operators.conjunction.isEqual(op)) {
            return this.ExpandConj;
        }
        if (operators.disjunction.isEqual(op)) {
            return this.ExpandDisj;
        }
        if (operators.conditional.isEqual(op)) {
            return this.ExpandCond;
        }
        return null;
    }
};
Object.defineProperty(justifications, "getSplit", { enumerable: false });
Object.defineProperty(justifications, "getExpansion", { enumerable: false });
Object.freeze(justifications);
export default justifications;