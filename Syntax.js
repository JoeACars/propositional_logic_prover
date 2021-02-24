///////////////////////////////////
//////////// Syntax.js ////////////
///////////////////////////////////

/// This file contains everything relating to logical syntax,
/// including sentence-letters, sentences and operators.


"use strict";


const displayNegation = "¬";
const displayConjunction = " ∧ ";
const displayDisjunction = " ∨ ";
const displayConditional = " → ";

export class Sentence {

    constructor(operator, ...args) {

        if (!(operator instanceof Operator)) {
            alert("Error - didn't provide Sentence constructor with an operator!");
            return;
        }

        if (operator.isEqual(operators.trivialOperator)) {
            this._operator = operators.trivialOperator;
            this._operands = [args[0]];
        }

        if (args.some(arg => !(arg instanceof Sentence) && !sentenceLetterCodes.includes(arg))) {
            alert("Error - provided Sentence constructor with invalid argument.");
            return;
        }

        this._operator = operator;
        this._operands = args.slice(0, operator.getArity());
    }

    getOperator() {
        return this._operator;
    }

    getOperand(index) {
        if (this._operator.isEqual(operators.trivialOperator) && index === 0) {
            return this;
        }
        return this._operands[index];
    }

    displayString(outer = true) {
        if (this._operator.isEqual(operators.trivialOperator)) {
            return this._operands[0];
        }
        else if (this._operator.getArity() === 1) {
            return this._operator.displayString() + this._operands[0].displayString(false);
        }
        else if (this._operator.getArity() === 2) {
            let dispString = this._operands[0].displayString(false) + this._operator.displayString() + this._operands[1].displayString(false);
            return outer ? dispString : ("(" + dispString + ")");
        }
        return "#DISPERROR#";
    }

    isEqual(other) {
        if (!(other instanceof Sentence)) {
            return false;
        }
        if (!this._operator.isEqual(other.getOperator())) {
            return false;
        }
        if (this._operator.isEqual(operators.trivialOperator)) {
            return this._operands[0] === other._operands[0];
        }
        for (let i = 0; i < other.getOperator().getArity(); i++) {
            if (!this.getOperand(i).isEqual(other.getOperand(i))) {
                return false;
            }
        }
        return true;
    }
}

const displaySentenceLetters = ["p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
export const sentenceLetters = new Map(displaySentenceLetters.map(char => [char, new Sentence(operators.trivialOperator, char)]));

export class Operator {

    static _idsTaken = [];

    constructor(id, arity) {

        // Check id is unique
        id = String(id);
        if (_idsTaken.includes(id)) {
            alert("Error! Tried to re-use an operator id.");
            return;
        }

        _idsTaken.push(id);
        this._id = id;

        arity = +arity;
        arity = arity >= 0 ? arity : -arity;
        arity -= arity % 1;
        this._arity = arity;

    }

    getId() {
        return this._id;
    }

    getArity() {
        return this._arity;
    }

    displayString() {
        if (this.isEqual(operators.negation)) {
            return displayNegation;
        }
        if (this.isEqual(operators.conjunction)) {
            return displayConjunction;
        }
        if (this.isEqual(operators.disjunction)) {
            return displayDisjunction;
        }
        if (this.isEqual(operators.conditional)) {
            return displayConditional;
        }
        return "#OPERROR#";
    }

    isEqual(other) {
        return other instanceof Operator && other.getId() === this.getId();
    }

}

export const operators;
Object.defineProperty(operators, "trivialOperator", { value: new Operator("triv", 1), enumerable: true });
Object.defineProperty(operators, "negation", { value: new Operator("not", 1), enumerable: true });
Object.defineProperty(operators, "conjunction", { value: new Operator("and", 2), enumerable: true });
Object.defineProperty(operators, "disjunction", { value: new Operator("or", 2), enumerable: true });
Object.defineProperty(operators, "conditional", { value: new Operator("cond", 2), enumerable: true });