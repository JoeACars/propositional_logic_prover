"use strict";

function Language(id, disp) {
    this.id = id;
    this.disp = disp;
}
const languages = {
    classical: new Language("classical", "Classical Propositional Logic"),
    FDE: new Language("fde", "First-Degree Entailment"),
    default: null
};
Object.defineProperty(languages, "default", { value: languages.classical, enumerable: false });
Object.freeze(languages);
export default languages;