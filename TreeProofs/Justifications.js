"use strict";

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
};
Object.freeze(justifications);
export default justifications;