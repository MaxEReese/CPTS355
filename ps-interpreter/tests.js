/**
 * tests.js — Automated test suite for the PostScript interpreter
 * Run with: node tests.js
 */

const Interpreter = require("./core/interpreter");
const tokenize    = require("./utils/tokenizer");

// ---------------------------------------------------------------------------
// Minimal test harness (no dependencies needed)
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓  ${description}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${description}`);
    console.error(`       ${e.message}`);
    failed++;
  }
}

function assert(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(
      (msg ? msg + " — " : "") +
      `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertThrows(fn, msgContains) {
  let threw = false;
  try { fn(); } catch (e) {
    threw = true;
    if (msgContains && !e.message.includes(msgContains)) {
      throw new Error(`Expected error containing "${msgContains}", got: "${e.message}"`);
    }
  }
  if (!threw) throw new Error("Expected an error but none was thrown");
}

/** Run a PostScript snippet and return the interpreter so you can inspect .stack */
function run(code, scoping) {
  const ps = new Interpreter();
  if (scoping) ps.setScoping(scoping);
  ps.run(tokenize(code));
  return ps;
}

/** Shorthand: run code and return top of stack */
function top(code, scoping) {
  return run(code, scoping).stack.at(-1);
}

// ---------------------------------------------------------------------------
// Stack Manipulation
// ---------------------------------------------------------------------------
console.log("\nStack Manipulation");

// Testing dup — input: "5 dup" — expected: two 5s on the stack
test("dup duplicates top", () => {
  const ps = run("5 dup");
  assert(ps.stack[0], 5);
  assert(ps.stack[1], 5);
});

// Testing pop — input: "3 7 pop" — expected: only 3 remains
test("pop removes top", () => {
  const ps = run("3 7 pop");
  assert(ps.stack.length, 1);
  assert(ps.stack[0], 3);
});

// Testing exch — input: "1 2 exch" — expected: stack is [2, 1]
test("exch swaps top two", () => {
  const ps = run("1 2 exch");
  assert(ps.stack[0], 2);
  assert(ps.stack[1], 1);
});

// Testing clear — input: "1 2 3 clear" — expected: empty stack
test("clear empties stack", () => {
  const ps = run("1 2 3 clear");
  assert(ps.stack.length, 0);
});

// Testing count — input: "1 2 3 count" — expected top: 3
test("count pushes stack depth", () => {
  assert(top("1 2 3 count"), 3);
});

// Testing count on empty stack — input: "count" — expected top: 0
test("count on empty stack returns 0", () => {
  assert(top("count"), 0);
});

// Testing copy — input: "1 2 3 2 copy" — expected: stack is [1, 2, 3, 2, 3]
test("copy duplicates top n items", () => {
  const ps = run("1 2 3 2 copy");
  assert(ps.stack.length, 5);
  assert(ps.stack[3], 2);
  assert(ps.stack[4], 3);
});

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------
console.log("\nArithmetic");

// Testing add — input: "3 4 add" — expected: 7
test("add",           () => assert(top("3 4 add"),      7));

// Testing sub — input: "10 3 sub" — expected: 7
test("sub",           () => assert(top("10 3 sub"),     7));

// Testing mul — input: "3 4 mul" — expected: 12
test("mul",           () => assert(top("3 4 mul"),      12));

// Testing div — input: "10 4 div" — expected: 2.5 (float result)
test("div",           () => assert(top("10 4 div"),     2.5));

// Testing idiv — input: "10 3 idiv" — expected: 3 (truncated integer division)
test("idiv",          () => assert(top("10 3 idiv"),    3));

// Testing idiv truncation — input: "7 2 idiv" — expected: 3 (not 3.5)
test("idiv truncates", () => assert(top("7 2 idiv"),   3));

// Testing mod — input: "10 3 mod" — expected: 1
test("mod",           () => assert(top("10 3 mod"),     1));

// Testing abs positive — input: "-5 abs" — expected: 5
test("abs negative",  () => assert(top("-5 abs"),       5));

// Testing abs on already positive — input: "5 abs" — expected: 5
test("abs positive",  () => assert(top("5 abs"),        5));

// Testing neg — input: "7 neg" — expected: -7
test("neg",           () => assert(top("7 neg"),        -7));

// Testing neg on negative — input: "-3 neg" — expected: 3
test("neg negative",  () => assert(top("-3 neg"),       3));

// Testing ceiling — input: "3.2 ceiling" — expected: 4
test("ceiling",       () => assert(top("3.2 ceiling"),  4));

// Testing ceiling on integer — input: "4 ceiling" — expected: 4
test("ceiling integer", () => assert(top("4 ceiling"), 4));

// Testing floor — input: "3.9 floor" — expected: 3
test("floor",         () => assert(top("3.9 floor"),    3));

// Testing floor on negative — input: "-4.1 floor" — expected: -5
test("floor negative", () => assert(top("-4.1 floor"), -5));

// Testing round up — input: "3.5 round" — expected: 4 (rounds up at .5)
test("round up",      () => assert(top("3.5 round"),    4));

// Testing round down — input: "3.4 round" — expected: 3
test("round down",    () => assert(top("3.4 round"),    3));

// Testing sqrt — input: "9 sqrt" — expected: 3
test("sqrt",          () => assert(top("9 sqrt"),       3));

// Testing sqrt float — input: "2 sqrt" — expected: ~1.414...
test("sqrt float",    () => assert(top("2 sqrt") > 1.41 && top("2 sqrt") < 1.42, true));

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------
console.log("\nComparison");

// Testing eq — input: "4 4 eq" — expected: true
test("eq true",        () => assert(top("4 4 eq"),   true));

// Testing eq — input: "4 5 eq" — expected: false
test("eq false",       () => assert(top("4 5 eq"),   false));

// Testing ne — input: "4 5 ne" — expected: true (they are not equal)
test("ne true",        () => assert(top("4 5 ne"),   true));

// Testing ne — input: "4 4 ne" — expected: false (they are equal)
test("ne false",       () => assert(top("4 4 ne"),   false));

// Testing lt true — input: "3 5 lt" — expected: true (3 < 5)
test("lt true",        () => assert(top("3 5 lt"),   true));

// Testing lt false — input: "5 3 lt" — expected: false (5 is not < 3)
test("lt false",       () => assert(top("5 3 lt"),   false));

// Testing gt true — input: "5 3 gt" — expected: true (5 > 3)
test("gt true",        () => assert(top("5 3 gt"),   true));

// Testing gt false — input: "3 5 gt" — expected: false (3 is not > 5)
test("gt false",       () => assert(top("3 5 gt"),   false));

// Testing le equal — input: "4 4 le" — expected: true (4 <= 4)
test("le equal",       () => assert(top("4 4 le"),   true));

// Testing le less — input: "3 4 le" — expected: true (3 <= 4)
test("le less",        () => assert(top("3 4 le"),   true));

// Testing le false — input: "5 4 le" — expected: false (5 is not <= 4)
test("le false",       () => assert(top("5 4 le"),   false));

// Testing ge equal — input: "5 3 ge" — expected: true (5 >= 3)
test("ge greater",     () => assert(top("5 3 ge"),   true));

// Testing ge equal — input: "4 4 ge" — expected: true (4 >= 4)
test("ge equal",       () => assert(top("4 4 ge"),   true));

// Testing ge false — input: "3 5 ge" — expected: false (3 is not >= 5)
test("ge false",       () => assert(top("3 5 ge"),   false));

// ---------------------------------------------------------------------------
// Boolean / Bitwise
// ---------------------------------------------------------------------------
console.log("\nBoolean / Bitwise");

// Testing true literal — input: "true" — expected top: true
test("true literal",    () => assert(top("true"),            true));

// Testing false literal — input: "false" — expected top: false
test("false literal",   () => assert(top("false"),           false));

// Testing and (logical) — input: "true true and" — expected: true
test("and true true",   () => assert(top("true true and"),   true));

// Testing and (logical) — input: "true false and" — expected: false
test("and true false",  () => assert(top("true false and"),  false));

// Testing and (logical) — input: "false false and" — expected: false
test("and false false", () => assert(top("false false and"), false));

// Testing or (logical) — input: "false true or" — expected: true
test("or false true",   () => assert(top("false true or"),   true));

// Testing or (logical) — input: "false false or" — expected: false
test("or false false",  () => assert(top("false false or"),  false));

// Testing or (logical) — input: "true true or" — expected: true
test("or true true",    () => assert(top("true true or"),    true));

// Testing not (logical) — input: "true not" — expected: false
test("not true",        () => assert(top("true not"),        false));

// Testing not (logical) — input: "false not" — expected: true
test("not false",       () => assert(top("false not"),       true));

// Testing and (bitwise) — input: "5 3 and" — expected: 1 (101 & 011 = 001)
test("and bitwise",     () => assert(top("5 3 and"),         1));

// Testing or (bitwise) — input: "5 3 or" — expected: 7 (101 | 011 = 111)
test("or bitwise",      () => assert(top("5 3 or"),          7));

// Testing not (bitwise) — input: "0 not" — expected: -1 (~0 = -1 in 32-bit)
test("not bitwise",     () => assert(top("0 not"),           -1));

// ---------------------------------------------------------------------------
// Dictionary
// ---------------------------------------------------------------------------
console.log("\nDictionary");

// Testing def and lookup — input: "/x 42 def x" — expected top: 42
test("def and lookup", () => {
  assert(top("/x 42 def  x"), 42);
});

// Testing dict creates object — input: "5 dict" — expected: dict with size 5
test("dict creates dict object", () => {
  const ps = run("5 dict");
  const d = ps.stack[0];
  assert(d.type, "dict");
  assert(d.size, 5);
});

// Testing maxlength — input: "5 dict maxlength" — expected: 5
test("maxlength returns capacity", () => {
  assert(top("5 dict maxlength"), 5);
});

// Testing begin/end with def — input: dict pushed, /y defined inside — expected: 99
test("begin/end and def inside dict", () => {
  const ps = run("5 dict begin  /y 99 def  y  end");
  assert(ps.stack[0], 99);
});

// Testing length on dict — input: dict with 2 entries — expected: 2
test("length of dict", () => {
  const ps = run("5 dict dup begin /a 1 def /b 2 def end length");
  assert(ps.stack[0], 2);
});

// Testing end isolates scope — variable defined inside begin/end not visible outside
test("end removes local scope", () => {
  assertThrows(() => run("5 dict begin /z 7 def end z"), "Undefined variable");
});

// Testing begin/end scoping — outer variable still accessible after end
test("outer variable accessible after end", () => {
  assert(top("/outer 55 def  5 dict begin /inner 1 def end  outer"), 55);
});

// ---------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------
console.log("\nStrings");

// Testing length — input: "(hello) length" — expected: 5
test("string length",      () => assert(top("(hello) length"),             5));

// Testing length empty — input: "() length" — expected: 0
test("empty string length", () => assert(top("() length"),                 0));

// Testing get — input: "(hello) 1 get" — expected: "e" (index 1)
test("get char at index",  () => assert(top("(hello) 1 get"),              "e"));

// Testing get first char — input: "(hello) 0 get" — expected: "h"
test("get first char",     () => assert(top("(hello) 0 get"),              "h"));

// Testing getinterval — input: "(hello) 1 3 getinterval" — expected: "ell"
test("getinterval",        () => assert(top("(hello) 1 3 getinterval"),    "ell"));

// Testing getinterval from start — input: "(hello) 0 3 getinterval" — expected: "hel"
test("getinterval from 0", () => assert(top("(hello) 0 3 getinterval"),   "hel"));

// Testing putinterval — input: "(hello) 1 (XY) putinterval" — expected: "hXYlo"
test("putinterval",        () => assert(top("(hello) 1 (XY) putinterval"), "hXYlo"));

// Testing putinterval at 0 — input: "(hello) 0 (AB) putinterval" — expected: "ABllo"
test("putinterval at 0",   () => assert(top("(hello) 0 (AB) putinterval"), "ABllo"));

// ---------------------------------------------------------------------------
// Flow Control
// ---------------------------------------------------------------------------
console.log("\nFlow Control");

// Testing if (true branch) — input: "true { 99 } if" — expected top: 99
test("if executes when true", () => {
  assert(top("true { 99 } if"), 99);
});

// Testing if (false branch) — input: "false { 99 } if" — expected: empty stack
test("if skips when false", () => {
  const ps = run("false { 99 } if");
  assert(ps.stack.length, 0);
});

// Testing ifelse (true) — input: "true { 1 } { 2 } ifelse" — expected top: 1
test("ifelse takes true branch", () => {
  assert(top("true { 1 } { 2 } ifelse"), 1);
});

// Testing ifelse (false) — input: "false { 1 } { 2 } ifelse" — expected top: 2
test("ifelse takes false branch", () => {
  assert(top("false { 1 } { 2 } ifelse"), 2);
});

// Testing repeat — input: "0 5 { 1 add } repeat" — expected top: 5
test("repeat executes n times", () => {
  assert(top("0  5 { 1 add } repeat"), 5);
});

// Testing repeat zero times — input: "99 0 { pop } repeat" — expected top: 99 (unchanged)
test("repeat zero times does nothing", () => {
  assert(top("99  0 { pop } repeat"), 99);
});

// Testing for — input: "1 1 5 { } for" — expected: stack is [1, 2, 3, 4, 5]
test("for iterates correctly", () => {
  const ps = run("1 1 5 { } for");
  assert(ps.stack.length, 5);
  assert(ps.stack[0], 1);
  assert(ps.stack[4], 5);
});

// Testing for step 2 — input: "0 2 6 { } for" — expected: stack is [0, 2, 4, 6]
test("for with step 2", () => {
  const ps = run("0 2 6 { } for");
  assert(ps.stack.length, 4);
  assert(ps.stack[3], 6);
});

// Testing for accumulation — input: "0 1 1 5 { add } for" — expected top: 15 (sum 1..5)
test("for accumulates sum", () => {
  assert(top("0  1 1 5 { add } for"), 15);
});

// Testing for negative step — input: "5 -1 1 { } for" — expected: stack is [5, 4, 3, 2, 1]
test("for with negative step", () => {
  const ps = run("5 -1 1 { } for");
  assert(ps.stack.length, 5);
  assert(ps.stack[0], 5);
  assert(ps.stack[4], 1);
});

// Testing quit — input: "1 quit 99" — expected: only 1 on stack (99 never pushed)
test("quit stops execution", () => {
  const ps = run("1 quit 99");
  assert(ps.stack.length, 1);
  assert(ps.stack[0], 1);
});

// Testing quit inside loop — input: quit fires inside repeat, stops immediately
test("quit stops loop early", () => {
  const ps = run("0  10 { 1 add quit } repeat");
  assert(ps.stack[0], 1); // only one iteration ran
});

// ---------------------------------------------------------------------------
// I/O
// ---------------------------------------------------------------------------
console.log("\nI/O");

// Testing print — verifies print doesn't crash and pops the value
// (output goes to stdout, we just verify the stack is empty after)
// input: "(hello) print" — expected: stack empty
test("print pops value", () => {
  const ps = run("(hello) print");
  assert(ps.stack.length, 0);
});

// Testing = — verifies = pops the value and leaves stack empty
// input: "42 =" — expected: stack empty
test("= pops value", () => {
  const ps = run("42 =");
  assert(ps.stack.length, 0);
});

// Testing == — verifies == pops the value and leaves stack empty
// input: "(hello) ==" — expected: stack empty
test("== pops value", () => {
  const ps = run("(hello) ==");
  assert(ps.stack.length, 0);
});

// ---------------------------------------------------------------------------
// Scoping
// ---------------------------------------------------------------------------
console.log("\nScoping");

// Testing dynamic scoping — foo is defined when x=10, x rebound to 20 before call.
// Dynamic: foo sees x=20 at call time.
// input: "/x 10 def /foo { x } def /x 20 def foo" — expected top: 20
test("dynamic scoping sees redefined x", () => {
  assert(top(`
    /x 10 def
    /foo { x } def
    /x 20 def
    foo
  `, "dynamic"), 20);
});

// Testing lexical scoping — bar closes over x=10 at definition time.
// Lexical: bar still sees x=10 even after x is rebound to 20.
// input: "/x 10 def /bar { x } def /x 20 def bar" — expected top: 10
test("lexical scoping captures x at definition time", () => {
  assert(top(`
    /x 10 def
    /bar { x } def
    /x 20 def
    bar
  `, "lexical"), 10);
});

// Testing the exact viva demo sequence in dynamic mode
// Open a local dict with x=20, call foo which adds x to 20 — expected: 40
test("dynamic scoping viva demo — local dict overrides x", () => {
  assert(top(`
    /x 10 def
    /foo { x add } def
    10 dict begin
      /x 20 def
      20 foo
    end
  `, "dynamic"), 40);
});

// Testing the exact viva demo sequence in lexical mode
// Open a local dict with x=20, call foo — lexical foo still uses x=10 — expected: 30
test("lexical scoping viva demo — local dict does not override x", () => {
  assert(top(`
    /x 10 def
    /foo { x add } def
    10 dict begin
      /x 20 def
      20 foo
    end
  `, "lexical"), 30);
});

// Testing setScoping validation — input: invalid mode "wat" — expected: throws
test("setScoping throws on invalid mode", () => {
  assertThrows(() => {
    const ps = new Interpreter();
    ps.setScoping("wat");
  }, "Invalid scoping mode");
});

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------
console.log("\nError Handling");

// Testing stack underflow — input: "pop" on empty stack — expected: throws
test("stack underflow throws", () => {
  assertThrows(() => run("pop"), "Stack underflow");
});

// Testing undefined variable — input: unknown name — expected: throws
test("undefined variable throws", () => {
  assertThrows(() => run("undefinedVar"), "Undefined variable");
});

// Testing maxlength on non-dict — expected: throws
test("maxlength on non-dict throws", () => {
  assertThrows(() => run("5 maxlength"), "maxlength");
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${"─".repeat(40)}`);
console.log(`  ${passed} passed   ${failed} failed`);
console.log(`${"─".repeat(40)}\n`);

if (failed > 0) process.exit(1);

// ---------------------------------------------------------------------------
// Edge Cases — Stack Manipulation
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Stack Manipulation");

// dup on a boolean — booleans should be duplicatable like any other value
test("dup works on boolean", () => {
  const ps = run("true dup");
  assert(ps.stack.length, 2);
  assert(ps.stack[0], true);
  assert(ps.stack[1], true);
});

// dup on zero — zero is falsy in JS but should still duplicate correctly
test("dup works on zero", () => {
  const ps = run("0 dup");
  assert(ps.stack[0], 0);
  assert(ps.stack[1], 0);
});

// exch on two identical values — stack should look the same but operation ran
test("exch on identical values", () => {
  const ps = run("5 5 exch");
  assert(ps.stack[0], 5);
  assert(ps.stack[1], 5);
});

// copy 0 — copying zero items should leave the stack unchanged
test("copy 0 leaves stack unchanged", () => {
  const ps = run("1 2 3 0 copy");
  assert(ps.stack.length, 3);
});

// copy 1 — same as dup
test("copy 1 duplicates top", () => {
  const ps = run("7 1 copy");
  assert(ps.stack.length, 2);
  assert(ps.stack[1], 7);
});

// clear on already empty stack — should not throw
test("clear on empty stack does not throw", () => {
  const ps = run("clear");
  assert(ps.stack.length, 0);
});

// pop then count — count should reflect correct depth after pop
test("count after pop", () => {
  assert(top("1 2 3 pop count"), 2);
});

// ---------------------------------------------------------------------------
// Edge Cases — Arithmetic
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Arithmetic");

// add with zero — identity element
test("add zero is identity", () => assert(top("5 0 add"), 5));

// mul by zero — always zero
test("mul by zero", () => assert(top("99 0 mul"), 0));

// mul by one — identity
test("mul by one", () => assert(top("7 1 mul"), 7));

// sub to produce zero
test("sub gives zero", () => assert(top("5 5 sub"), 0));

// sub to produce negative
test("sub gives negative", () => assert(top("3 7 sub"), -4));

// div by 1 — identity
test("div by one", () => assert(top("9 1 div"), 9));

// idiv with exact division — no truncation needed
test("idiv exact", () => assert(top("9 3 idiv"), 3));

// mod where result is zero — divisible evenly
test("mod zero remainder", () => assert(top("9 3 mod"), 0));

// mod with larger divisor — result is the number itself
test("mod larger divisor", () => assert(top("3 9 mod"), 3));

// neg of zero — should still be zero
test("neg zero", () => assert(top("0 neg"), 0));

// abs of zero
test("abs zero", () => assert(top("0 abs"), 0));

// ceiling of negative float — rounds toward zero
test("ceiling negative float", () => assert(top("-3.7 ceiling"), -3));

// floor of exact integer — unchanged
test("floor of integer", () => assert(top("5 floor"), 5));

// round exactly at 0.5 — rounds up
test("round 0.5 rounds up", () => assert(top("0.5 round"), 1));

// round negative 0.5
test("round -0.5", () => assert(top("-0.5 round"), 0));

// sqrt of 0
test("sqrt of zero", () => assert(top("0 sqrt"), 0));

// sqrt of 1
test("sqrt of one", () => assert(top("1 sqrt"), 1));

// chained arithmetic — multiple ops in sequence
test("chained arithmetic", () => assert(top("2 3 add 4 mul 2 sub"), 18));

// ---------------------------------------------------------------------------
// Edge Cases — Comparison
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Comparison");

// eq on booleans
test("eq true true", () => assert(top("true true eq"), true));
test("eq true false", () => assert(top("true false eq"), false));

// eq on strings
test("eq strings equal", () => assert(top("(hello) (hello) eq"), true));
test("eq strings not equal", () => assert(top("(hello) (world) eq"), false));

// ne on strings
test("ne strings", () => assert(top("(a) (b) ne"), true));

// lt on strings — lexicographic comparison
test("lt strings", () => assert(top("(apple) (banana) lt"), true));

// compare negative numbers
test("lt negative numbers", () => assert(top("-5 -3 lt"), true));
test("gt negative numbers", () => assert(top("-1 -5 gt"), true));

// compare zero and negative
test("gt zero vs negative", () => assert(top("0 -1 gt"), true));
test("lt zero vs positive", () => assert(top("0 1 lt"), true));

// ---------------------------------------------------------------------------
// Edge Cases — Boolean / Bitwise
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Boolean / Bitwise");

// not not — double negation returns original
test("not not true is true", () => assert(top("true not not"), true));
test("not not false is false", () => assert(top("false not not"), false));

// and with itself
test("bitwise and with itself", () => assert(top("6 6 and"), 6));

// or with zero — identity for bitwise or
test("bitwise or with zero", () => assert(top("5 0 or"), 5));

// and with zero — always zero
test("bitwise and with zero", () => assert(top("5 0 and"), 0));

// not 1 — bitwise NOT of 1 is -2 in 32-bit
test("bitwise not 1", () => assert(top("1 not"), -2));

// boolean used in ifelse
test("true used in ifelse", () => assert(top("true { 1 } { 2 } ifelse"), 1));
test("false used in ifelse", () => assert(top("false { 1 } { 2 } ifelse"), 2));

// ---------------------------------------------------------------------------
// Edge Cases — Dictionary
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Dictionary");

// redefine a variable — def should overwrite the old value
test("def overwrites existing key", () => {
  assert(top("/x 1 def  /x 99 def  x"), 99);
});

// length of empty dict — should be 0
test("length of empty dict is 0", () => {
  assert(top("5 dict dup begin end length"), 0);
});

// nested begin/end — inner dict shadows outer variable
test("inner dict shadows outer variable", () => {
  assert(top(`
    /x 1 def
    5 dict begin
      /x 2 def
      x
    end
  `), 2);
});

// outer variable visible from inside begin/end
test("outer variable visible inside begin", () => {
  assert(top(`
    /x 42 def
    5 dict begin
      x
    end
  `), 42);
});

// multiple begin/end pairs — each isolated
test("multiple begin/end pairs are independent", () => {
  const ps = run(`
    5 dict begin /a 1 def end
    5 dict begin /b 2 def end
  `);
  assertThrows(() => run(`
    5 dict begin /a 1 def end
    5 dict begin /b 2 def end
    a
  `), "Undefined variable");
});

// def a procedure then call it
test("def stores and calls a procedure", () => {
  assert(top("/double { 2 mul } def  7 double"), 14);
});

// ---------------------------------------------------------------------------
// Edge Cases — Strings
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Strings");

// single character string
test("single char string length", () => assert(top("(a) length"), 1));

// get last character
test("get last char", () => assert(top("(hello) 4 get"), "o"));

// getinterval entire string
test("getinterval full string", () => assert(top("(hello) 0 5 getinterval"), "hello"));

// getinterval single char
test("getinterval single char", () => assert(top("(hello) 2 1 getinterval"), "l"));

// putinterval with same-length replacement
test("putinterval same length", () => assert(top("(hello) 0 (world) putinterval"), "world"));

// putinterval single char
test("putinterval single char", () => assert(top("(hello) 0 (X) putinterval"), "Xello"));

// string equality via eq
test("string eq true", () => assert(top("(abc) (abc) eq"), true));
test("string eq false", () => assert(top("(abc) (xyz) eq"), false));

// nested parens in string literal
test("nested parens in string", () => assert(top("(a(b)c) length"), 5));

// ---------------------------------------------------------------------------
// Edge Cases — Flow Control
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Flow Control");

// if with complex procedure body
test("if with multiple ops in body", () => {
  assert(top("true { 3 4 add 2 mul } if"), 14);
});

// ifelse both branches have side effects — only one runs
test("ifelse only one branch runs", () => {
  const ps = run("true { 1 } { 2 } ifelse");
  assert(ps.stack.length, 1);
  assert(ps.stack[0], 1);
});

// nested if inside for
test("if inside for", () => {
  // push only even numbers from 1..6
  const ps = run("1 1 6 { dup 2 mod 0 eq { dup } if pop } for");
  assert(ps.stack.length, 3); // 2, 4, 6
  assert(ps.stack[0], 2);
  assert(ps.stack[2], 6);
});

// for with single iteration
test("for single iteration", () => {
  const ps = run("5 1 5 { } for");
  assert(ps.stack.length, 1);
  assert(ps.stack[0], 5);
});

// repeat builds a value correctly
test("repeat builds value", () => {
  // 2^5 = 32 by starting at 1 and doubling 5 times
  assert(top("1  5 { 2 mul } repeat"), 32);
});

// nested repeat
test("nested repeat", () => {
  // outer 3 times, inner 3 times = 9 total increments
  assert(top("0  3 { 3 { 1 add } repeat } repeat"), 9);
});

// for with procedure that uses the counter
test("for counter used in body", () => {
  // sum of squares: 1^2 + 2^2 + 3^2 = 14
  assert(top("0  1 1 3 { dup mul add } for"), 14);
});

// ifelse inside repeat
test("ifelse inside repeat", () => {
  // count how many of 1..4 are > 2: answer is 2 (3 and 4)
  assert(top("0  1 1 4 { 2 gt { 1 add } { } ifelse } for"), 2);
});

// ---------------------------------------------------------------------------
// Edge Cases — Scoping
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Scoping");

// dynamic: procedure picks up variable from calling scope
test("dynamic sees caller scope variable", () => {
  assert(top(`
    /printX { x } def
    /x 77 def
    printX
  `, "dynamic"), 77);
});

// lexical: nested procedures each close over their own env
test("lexical nested closures are independent", () => {
  assert(top(`
    /x 1 def
    /getX { x } def
    /x 2 def
    /getX2 { x } def
    getX
  `, "lexical"), 1);
});

// lexical: redefining a proc picks up new env
test("lexical redefining proc captures new env", () => {
  assert(top(`
    /x 1 def
    /getX { x } def
    /x 2 def
    /getX { x } def
    getX
  `, "lexical"), 2);
});

// dynamic: variable defined inside proc visible to callee
test("dynamic callee sees caller local variable", () => {
  assert(top(`
    /inner { y } def
    /outer { /y 42 def inner } def
    outer
  `, "dynamic"), 42);
});

// lexical: variable defined inside proc NOT visible to callee
test("lexical callee does not see caller local variable", () => {
  assertThrows(() => run(`
    /inner { y } def
    /outer { /y 42 def inner } def
    outer
  `, "lexical"), "Undefined variable");
});

// ---------------------------------------------------------------------------
// Edge Cases — Error Handling
// ---------------------------------------------------------------------------
console.log("\nEdge Cases — Error Handling");

// underflow on add — needs 2 operands, only 1 on stack
test("add with one operand throws underflow", () => {
  assertThrows(() => run("5 add"), "Stack underflow");
});

// underflow on exch — needs 2 operands
test("exch with one operand throws underflow", () => {
  assertThrows(() => run("5 exch"), "Stack underflow");
});

// underflow on dup — needs 1 operand
test("dup on empty stack throws underflow", () => {
  assertThrows(() => run("dup"), "Stack underflow");
});

// underflow on mul
test("mul with empty stack throws underflow", () => {
  assertThrows(() => run("mul"), "Stack underflow");
});

// unknown token
test("unknown token throws", () => {
  assertThrows(() => run("notACommand"), "Undefined variable");
});

// if with non-boolean condition — false-y values should not execute
test("if with false boolean skips", () => {
  const ps = run("false { 999 } if");
  assert(ps.stack.length, 0);
});