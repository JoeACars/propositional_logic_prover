"use strict";

import Operator from "./Operator.js";
import operators from "./Operators.js";

const sentenceLetters = ["p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
const atomicSentences = new Map(displaySentenceLetters.map(char => [char, new Sentence(operators.trivialOperator, char)]));

export default class Sentence {

    constructor(operator, ...args) {

        if (!(operator instanceof Operator)) {
            alert("Error - didn't provide Sentence constructor with an operator!");
            return;
        }

        if (operator.isEqual(operators.trivialOperator)) {
            this._operator = operators.trivialOperator;
            this._operands = [args[0]];
        }

        if (args.some(arg => !(arg instanceof Sentence) && !sentenceLetters.includes(arg))) {
            alert("Error - provided Sentence constructor with invalid argument.");
            return;
        }

        this._operator = operator;
        this._operands = args.slice(0, operator.getArity());
    }

    static getAtomicSentences() {
        return atomicSentences;
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