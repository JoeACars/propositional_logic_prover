# propositional_logic_prover

Given a logic and a propositional argument, seeks to establish the validity of the argument in the given logic. At the moment, Classical Propositional Logic and First-Degree Entailment have been implemented.

## What does it do?

### What is a logic?

Speaking roughly, a *logic* is a set of rules which determine whether a given set of premises entails a given set of conclusions. For example, a standard form of argument is called *modus ponens*: if it is true that sentence 1 implies sentence 2, and sentence 1 is true, then it follows that sentence 2 is true. We usually write "sentence 1", "sentence 2" and so on as "p", "q", "r" etc, and we usually write "if p then q" as "p → q". In addition to →, we also write p ∧ q for "p and q", p ∨ q for "p or q" and ¬p for "not p". We also can use the turnstile symbol, ⊢, for "entails", so we can write modus ponens as follows:

    p → q, p ⊢ q

In formal logic, a set of premises e.g. { p → q, p } together with a set of conclusions e.g. { q } is called an "argument". A statement like the above with a turnstile in it is called a "validity statement", and says that the argument from { p → q, p } to { q } is "valid". To say that an argument is valid roughly means that it's logically impossible for all the premises to be true and all the conclusions to be false. To get you more of a flavour, here are a few more arguments that are valid in Classical Propositional Logic:

           p ∧ q ⊢ p     (simplification)
             ¬¬p ⊢ p     (double negation elimination)
       p → q, ¬q ⊢ ¬p    (modus tollens)
    ¬(p ∨ q), ¬q ⊢ p     (modus tollendo ponens)

In other places, you will see variations on this, but this is probably the most common notation, and we'll adopt it consistently here. We should also note that the arrow is sometimes called the "conditional", ∧ is called "conjunction", ∨ is called "disjunction" and ¬ is called "negation".

### Theorems

An argument with no premises and a single conclusion is called a "theorem" (also "tautology"). For example, in Classical Propositional Logic, the Law of Excluded Middle (LEM) and the Law of Non-Contradiction (LNC) are valid:

    ⊢ p ∨ ¬p       (LEM)
    ⊢ ¬(p ∧ ¬p)    (LNC)

These validity-statements roughly say that LEM and LNC are *always true*, no matter what. We don't need to assume any premises to know that either p is true or p is false, or that p isn't both true and false.

### Sets of conclusions

But what is this a "set of conclusions", and what does that mean? In the above, we've only looked at single-conclusion arguments, which are easy to understand. A single-conclusion argument is valid if and only if whenever all the premises are true, the conclusion is true, too.

To get to multi-conclusion arguments, we just need to generalise: a multi-conclusion argument is valid if and only if whenever all the premises are true, *at least one* of the conclusions is true, too.

That might sound weirdly un-symmetrical. Why "all" the premises, but just "at least one" of the conclusions? Why not all the conclusions? Though you might not believe me just yet, trust me - this is definitely the most sensible way of doing it. Perhaps you'll see the rationale better if I express it another way: an argument is valid if and only if it is logically impossible for all the premises to be true and none of the conclusions to be true.

Most of the time, you won't have to worry about multi-conclusion arguments: they're much less common than single-conclusion arguments. However, they do come up. For example, in First-Degree Entailment, modus ponens

    p, p → q ⊢ q

is invalid. However, something close to it is valid:

    p, p → q ⊢ q, p ∧ ¬p

This is a multi-conclusion argument: what it says is that if p and p → q are true, then either q is true or p ∧ ¬p is true. (And if you're wondering - yes, in First-Degree Entailment, p can be both true and false! We'll get to that later.)

## How does it work?
