"use strict";


class Sentence {

    constructor(operator, ...args) {

        if (!(operator instanceof Operator)) {
            alert("Error - didn't provide Sentence constructor with an operator!");
            return;
        }

        if (args.some(arg => !(arg instanceof Sentence) && !sentenceLetterCodes.includes(arg))) {
            alert("Error - provided Sentence constructor with invalid argument.");
            return;
        }

        if (operator.isEqual(trivialOperator)) {
            this._operator = trivialOperator;
            this._operands = [args[0]];
        }
        else {
            this._operator = operator;
            this._operands = args.slice(0, operator.getArity());
        }
    }

    getOperator() {
        return this._operator;
    }

    getOperand(index) {
        if (this._operator.isEqual(trivialOperator) && index === 0) {
            return this;
        }
        return this._operands[index];
    }

    displayString(outer = true) {
        if (this._operator.isEqual(trivialOperator)) {
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
        if (this._operator.isEqual(trivialOperator)) {
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

class Operator {

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
        if (this.isEqual(operatorNegation)) {
            return displayNegation;
        }
        if (this.isEqual(operatorConjunction)) {
            return displayConjunction;
        }
        if (this.isEqual(operatorDisjunction)) {
            return displayDisjunction;
        }
        if (this.isEqual(operatorConditional)) {
            return displayConditional;
        }
        return "#OPERROR#";
    }

    isEqual(other) {
        return other instanceof Operator && other.getId() === this.getId();
    }

}

const trivialOperator = new Operator("triv", 1);
const operatorNegation = new Operator("cNot", 1);
const operatorConjunction = new Operator("cAnd", 2);
const operatorDisjunction = new Operator("cOr", 2);
const operatorConditional = new Operator("cCond", 2);