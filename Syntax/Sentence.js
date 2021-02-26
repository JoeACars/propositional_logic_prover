"use strict";

import Operator from "./Operator.js";
import operators from "./Operators.js";

export default class Sentence {

    constructor(operator, ...args) {

        if (!(operator instanceof Operator)) {
            throw new Error("Didn't provide Sentence constructor with an operator.");
            return;
        }

        if (operator.isEqual(operators.trivialOperator)) {
            this._operator = operators.trivialOperator;
            this._operands = [args[0]];
        }

        if (args.some(arg => !(arg instanceof Sentence) && !sentenceLetters.includes(arg))) {
            throw new Error("Provided Sentence constructor with invalid argument.");
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

    getDisplayString(outer = true) {
        if (this._operator.isEqual(operators.trivialOperator)) {
            return this._operands[0];
        }
        else if (this._operator.getArity() === 1) {
            return operators.getDisplayString(this._operator) + this._operands[0].getDisplayString(false);
        }
        else if (this._operator.getArity() === 2) {
            let dispString = this._operands[0].getDisplayString(false) + operators.getDisplayString(this._operator) + this._operands[1].getDisplayString(false);
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

const sentenceLetters = ["p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
const atomicSentences = new Map(sentenceLetters.map(char => [char, new Sentence(operators.trivialOperator, char)]));