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

## How do you prove things?

This software uses a family of proof methods called "tree proofs", so called because they have a kind of tree structure, with nodes and branches. The following is not supposed to be a rigorous introduction to tree proofs, but hopefully, even if you're new to tree proofs, you can get enough of a picture to piece together roughly what's going on. I recommend you follow along this explanation with some examples, which you can generate yourself using the program.

Recall that an argument is *valid* if and only if it is logically impossible for all the premises to be true and all the conclusions to fail to be true. So essentially, what a tree proof does is assume that the premises are all true and the conclusions fail to be true, and fleshes out the logical consequences of those assumptions. If that lands us in contradiction, the argument must have been valid. If not, it was invalid.

How can we *flesh out the logical consequences*? Well, it looks a little different depending on the logical system. But let's take Classical Propositional Logic to start off with, as it's the simplest. In this case, we "assume the premises are true" by simply writing them down, one to a line, and we "assume the conclusions fail to be true" by doing the same thing, but negating each of them first. (Try it out and see!)

Now, we take a look at what we've got. If on any line, we have a double negation, e.g. <code>¬¬A</code> for some sentence <code>A</code>, we can append a new line saying <code>A</code>. For example, if we had <code>¬¬(p → q)</code>, we can append <code>p → q</code>. This rule is called "double negation elimination", because we "eliminate" the double negation. We can also, for example, expand a conditional: if we have <code>A ∧ B</code> for some sentences <code>A</code> and <code>B</code>, we can append <code>A</code> and we can append <code>B</code>. Makes sense, right? If <code>A ∧ B</code> is true, then <code>A</code> is true and <code>B</code> is true.

We said that tree proofs involve branching. That's because some operators don't tell us anything certain about their operands, but they do restrict the possibilities. For example, if we have <code>A ∨ B</code>, we don't know anything about the truth of <code>A</code> nor of <code>B</code> on their own - but we do know that there are only two possibilities: either <code>A</code> is true, or <code>B</code> is true. (Of course, they could *both* be true - in formal logic, "or" is always inclusive, unless otherwise specified.) In a tree proof, we write this by *splitting* the proof into two branches. On the left branch, we append <code>A</code>, and on the right branch, we append <code>B</code>.

Once you've split, you work on one branch at a time, typically from left-to-right. You can call the branch you're working on as the "active" branch. From a child branch, you can still use lines from the parent branch to continue expanding your proof. (Try this out with the premises p ∨ q and q ∨ r.) You can't use lines from your sibling branches, however. Child branches represent "more specific" logical possibilities, whereas sibling branches represent "alternative" logical possibilities.

In Classical Propositional Logic, every sentence except atomic sentences and negated atomic sentences can be expanded in some way. You can try this out by just typing in one premise, and going through all the different forms a sentence could take:
* ¬¬p
* p → q
* p ∧ q
* p ∨ q
* ¬(p → q)
* ¬(p ∧ q)
* ¬(p ∨ q)

So that's how you *flesh out the logical consequences*. Once you've "fleshed out the consequences" as much as you possibly can - once you've "used" every complex sentence until you're just left with (negated) atomic sentences - you take a look at the active branch. If, from the active branch or any of its parents, there is any line saying the sentence <code>¬A</code> with another line saying <code>A</code>, you have a "contradiction", and you "close the branch". You close the branch by putting an X at the bottom, and you move on to the next branch you haven't finished working on yet. (Or, if there are no other unfinished branches, your proof is complete!) If there aren't any contradictions, however, the argument must have been invalid: what we've done is found a logical possibility, a way things could have been, that makes the premises all true and the conclusions all false.

### Paraconsistent tree proofs

In paraconsistent logical systems like First-Degree Entailment, things work a little differently, because sentences might be both true and false, or neither true nor false. In Classical Propositional Logic, we essentially wrote "A is true" on a line by simply writing A, and we wrote "A is not true" by writing ¬A. However, in paraconsistent logics, we need to account for the possibility that something could fail to be true without being false and vice versa. For this, we introduce little tokens to tell us whether the sentence on the given line is true, not true, false or not false:
* <img src=".\Graphics\truthmarkertrue.png" height="10px" width="10px"/> (true)
* <img src=".\Graphics\truthmarkernottrue.png" height="10px" width="10px"/> (not true)
* <img src=".\Graphics\truthmarkerfalse.png" height="10px" width="10px"/> (false)
* <img src=".\Graphics\truthmarkernotfalse.png" height="10px" width="10px"/> (not false)
Instead of doing double-negation elimination, we do simply negation-elimination (try it out and see how it works!). Because we can eliminate negation, we no longer need rules for negated complex sentences:
* ¬(p → q)
* ¬(p ∧ q)
* ¬(p ∨ q)
However, we do need rules for all four truth-markers. I encourage you to try them all out and see how they work.

Of course, since contradictions are considered "logically possible" in paraconsistent logics, we'll have to have a new criterion for when we're allowed to close a branch. That criterion is reasonably straightforward: if we have <img src=".\Graphics\truthmarkertrue.png" height="10px" width="10px"/> <code>A</code> on one line and <img src=".\Graphics\truthmarkernot.png" height="10px" width="10px"/> <code>A</code> on another, or <img src=".\Graphics\truthmarkerfalse.png" height="10px" width="10px"/> <code>A</code> on one line and <img src=".\Graphics\truthmarkernotfalse.png" height="10px" width="10px"/> <code>A</code> on another, we can close the branch.

## How does it work?

The following sections are given in order of dependency. They are also the names of folders in the repository.

### Syntax

First, <code>Operator.js</code> defines the <code>Operator</code> class. Each instance of <code>Operator</code> has its own unique string id, and an integer arity. Negation is a unary (arity 1) operator, for instance, while conjunction is a binary (arity 2) operator. (Although not implemented here, there are in some logics operators with different arities, including operators of arbitrary arity such as n-ary conjunction, or even the standard zeroary operators, verum and falsum.)

Then, <code>Operators.js</code> defines the <code>operators</code> global constant object, storing instances of the <code>Operator</code> class corresponding to the usual operators: negation, conjunction, disjunction and conditionals. In addition to those, there is also the trivial operator, which essentially means "do nothing to the sentence". If this sounds redundant, read on...

Finally, <code>Sentence.js</code> defines the <code>Sentence</code> class, representing a sentence in formal logic. A <code>Sentence</code> object is essentially just an <code>Operator</code> together with a list of operands. The idea is that you can start of with the atomic sentences, p, q, r etc, and combine them using operators to make ever more complex sentences. You can retrieve the Operator of a Sentence by calling <code>Sentence.getOperator()</code> and you can retrieve the n<sup>th</sup> operand of a Sentence with <code>Sentence.getOperand(n)</code>.

But what are atomic sentences? Given they are just the basic p, q, r etc, surely they have neither an operator nor an operand, so surely they can't be implemented by <code>Sentence</code>? However, if we were to implement atomic sentences this way, we'd run into problems. To keep our code simple and error-resistant, we should insist on three things:
* sentences, whether atomic or complex, should always be represented by a Sentence object,
* <code>Sentence.getOperator()</code> should always be defined and
* <code>Sentence.getOperand(n)</code> should, if defined, always return another Sentence.

The good news is, we tick all these boxes in the way we implement atomic sentences.
* Atomic sentences are represented by Sentence objects (in particular, there's a fixed list of them, accessible by the static method <code>Sentence.getAtomicSentences()</code>). Complex Sentences are always constructed from these atomic Sentences by combining them with Operators.
* In the case of atomic sentences, <code>Sentence.getOperator()</code> returns the trivial operator.
* In the case of atomic sentences, <code>Sentence.getOperator(0)</code> returns itself.
The only potential problem these raises is that if you forget about the last bullet point, you could get stuck in an infinite loop, calling <code>getOperator(0)</code> forever and ever and getting nowhere. Thankfully, there's really only one time you need to get the "value" of an atomic sentence, and that's when you're displaying it. Check out <code>Sentence.getDisplayString()</code> to see how this is handled.

### TreeProofs

First, we start with the basic elements of a line in a proof: truth-value markers (true, not true, false, not false) and justifications (which rule did we use to derive this line? from which other lines?). Sentences are already defined under Syntax. So, we put these three together and we have a sentential line content, represented by a <code>LineContentSentence</code> object, which is an implementation of the <code>LineContent</code> interface. A <code>Line</code> object is a <code>LineContent</code> object together with a line number.

Why all the business with interfaces? Well, in some other (as-yet-unimplemented) logics, we need lines that don't contain sentences. Instead, they contain "accessibility relations", which you need know nothing about, other than that they aren't sentences. They're not p, q, r etc combined together with Operators. So, in the spirit of extendibility, we don't require that every <code>Line</code> has to have a sentence in it. Instead, it just has to have a <code>LineContent</code>, of which one species is a <code>LineContentSentence</code>, and another kind (as-yet-unimplemented) might be <code>LineContentAccessibilityRelation</code>.

Now that we have Lines, we move on to <code>Segment</code>. Picture a tree proof with lots of branches. A <code>Segment</code> represents a piece of a branch running from wherever it starts to wherever it splits (or ends). Each <code>Segment</code> knows who its parent is (if it has one) and who its children are (if it has any).

Finally, right up at the top if the <code>TreeProof</code> itself. This object has a reference to its root segment (the one at the very top, with no parent) and, if we're actively working on the proof, to its active segment. This is where prover functions (see next section) interact with the proof, so it includes functions for appending lines to the active segment, ending the active segment and moving on to the next one and retrieving the lines that can be used in the active segment, among other things.

### Prove

This is where the prover functions live. There's one for Classical Propositional Logic, and one for First-Degree Entailment. There are also two functions for deciding whether or not to close a branch - for the former, we have <code>ContainsSententialContradiction()</code> for finding joint occurences of <code>A</code> and <code>¬A</code>. For the latter, we have <code>ContainsTruthValueContradiction()</code> for finding joint occurrences of <code>A</code> with incompatible truth-value markers.
