"use strict";

export default class Operator {

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

    isEqual(other) {
        return other instanceof Operator && other.getId() === this.getId();
    }

}