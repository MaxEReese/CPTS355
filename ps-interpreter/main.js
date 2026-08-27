const Interpreter = require("./core/interpreter");
const tokenize    = require("./utils/tokenizer");

// Helper to run a snippet and suppress printing so we can show output inline
function demo(label, program, scoping) {
  console.log(`\n-- ${label} --`);
  console.log("Program:");
  program.trim().split("\n").forEach(l => console.log("  " + l.trim()));
  process.stdout.write("Output: ");
  const ps = new Interpreter();
  ps.setScoping(scoping);
  ps.run(tokenize(program));
  if (ps.stack.length > 0) console.log(); // newline if = wasn't used
}

console.log("=========================================");
console.log("  Dynamic vs Lexical Scoping ");
console.log("=========================================");

// ---------------------------------------------------------------------------
// Example 1 — Numbers (baseline)
// The classic example: a variable is rebound after a procedure is defined.
// Dynamic sees the new value; lexical remembers the old one.
// ---------------------------------------------------------------------------
console.log("\n\n=== Example 1: Variable Rebinding ===");
console.log("x starts as 10, a procedure is defined, then x is changed to 20.");
console.log("Dynamic scoping uses x at call time; lexical uses x at definition time.\n");

demo("Dynamic — sees x = 20 (call time)", `
  /x 10 def
  /getX { x } def
  /x 20 def
  getX =
`, "dynamic");

demo("Lexical  — sees x = 10 (definition time)", `
  /x 10 def
  /getX { x } def
  /x 20 def
  getX =
`, "lexical");

// ---------------------------------------------------------------------------
// Example 2 — Strings
// The procedure greets using a /name variable.
// Dynamic: sees whoever /name points to at call time.
// Lexical:  always greets the person it was defined for.
// ---------------------------------------------------------------------------
console.log("\n\n=== Example 2: String Variable ===");
console.log("/name is set to (Alice), greet is defined, then /name changes to (Bob).");
console.log("Dynamic greets Bob; lexical still greets Alice.\n");

demo("Dynamic — greets Bob (name at call time)", `
  /name (Alice) def
  /greet { (Hello, ) print name print (!) print } def
  /name (Bob) def
  greet
`, "dynamic");
console.log();

demo("Lexical  — greets Alice (name at definition time)", `
  /name (Alice) def
  /greet { (Hello, ) print name print (!) print } def
  /name (Bob) def
  greet
`, "lexical");
console.log();

// ---------------------------------------------------------------------------
// Example 3 — Arithmetic using a shared multiplier
// /scale is used inside a procedure to multiply a value.
// Dynamic: the multiplier can be overridden by the caller.
// Lexical:  the multiplier is fixed at the time the procedure was written.
// ---------------------------------------------------------------------------
console.log("\n\n=== Example 3: Shared Multiplier ===");
console.log("/scale starts as 2, /double is defined to multiply by scale,");
console.log("then scale is changed to 10 before calling double.\n");

demo("Dynamic — multiplies by 10 (scale at call time)", `
  /scale 2 def
  /double { scale mul } def
  /scale 10 def
  5 double =
`, "dynamic");

demo("Lexical  — multiplies by 2 (scale at definition time)", `
  /scale 2 def
  /double { scale mul } def
  /scale 10 def
  5 double =
`, "lexical");

// ---------------------------------------------------------------------------
// Example 4 — Nested procedures
// /msg is used inside an inner procedure called by an outer one.
// Dynamic: the inner proc sees /msg as set by the outer caller's environment.
// Lexical:  the inner proc always sees /msg as it was when it was defined.
// ---------------------------------------------------------------------------
console.log("\n\n=== Example 4: Nested Procedures ===");
console.log("/msg is (original), /inner prints msg, /outer redefines msg to (overridden)");
console.log("then calls inner. Dynamic sees the overridden msg; lexical sees original.\n");

demo("Dynamic — prints overridden (msg changed before inner runs)", `
  /msg (original) def
  /inner { msg = } def
  /outer { /msg (overridden) def inner } def
  outer
`, "dynamic");

demo("Lexical  — prints original (inner closed over msg at definition time)", `
  /msg (original) def
  /inner { msg = } def
  /outer { /msg (overridden) def inner } def
  outer
`, "lexical");