# PostScript Interpreter

A PostScript interpreter implemented in JavaScript (Node.js) for CPTS 355.  
Supports dynamic scoping by default with a toggle to lexical (static) scoping.

---

## Project Structure

```
project/
├── core/
│   └── interpreter.js     # Interpreter class — execution engine, scoping, def/lookup
├── ops/
│   ├── arithmetic.js      # add, sub, mul, div, idiv, mod, abs, neg, ceiling, floor, round, sqrt
│   ├── boolean.js         # and, or, not (logical and bitwise)
│   ├── comparison.js      # eq, ne, lt, gt, le, ge
│   ├── dictionary.js      # dict, begin, end, length (dict), maxlength
│   ├── flow.js            # if, ifelse, for, repeat, quit
│   ├── io.js              # print, =, ==
│   ├── stack.js           # exch, pop, copy, dup, clear, count
│   └── strings.js         # length (string), get, getinterval, putinterval
├── utils/
│   └── tokenizer.js       # Tokenizer — numbers, booleans, strings, procedures
├── main.js                # Scoping demonstration (dynamic vs lexical)
├── repl.js                # Interactive REPL
└── tests.js               # Automated test suite
```

---

## Requirements

- [Node.js](https://nodejs.org/) v14 or later
- No external dependencies — the standard library is sufficient

---

## Running the Interpreter

### Run the scoping demonstration

```bash
node main.js
```

This runs two programs side by side demonstrating dynamic vs lexical scoping behavior:

```
20    ← dynamic scoping: foo sees x=20, the value at call time
10    ← lexical scoping: bar sees x=10, the value at definition time
```

### Start the interactive REPL

```bash
node repl.js
```

Type PostScript expressions line by line:

```
> 3 4 add =
7
> /x 10 def
> x =
10
> exit
```

---

## Toggling Scoping Mode

### In the REPL

Use the `:scope` command at any prompt:

```
> :scope dynamic     ← switch to dynamic scoping (default)
> :scope lexical     ← switch to lexical (static) scoping
```

### In code

```javascript
const ps = new Interpreter();
ps.setScoping("dynamic"); // default — PostScript standard
ps.setScoping("lexical"); // static/lexical scoping
```

### Demonstrating the difference

With **dynamic scoping**, a procedure looks up variables in the dictionary stack at *call time*:

```postscript
/x 10 def
/foo { x } def
/x 20 def
foo =          % prints 20 — sees the current x
```

With **lexical scoping**, a procedure closes over the environment at *definition time*:

```postscript
/x 10 def
/bar { x } def
/x 20 def
bar =          % prints 10 — sees x as it was when bar was defined
```

---

## Running the Tests

```bash
node tests.js
```

Expected output:

```
Stack Manipulation
  ✓  dup duplicates top
  ✓  pop removes top
  ...

─────────────────────────────────────────
  N passed   0 failed
─────────────────────────────────────────
```

The test suite exits with code `1` if any tests fail, making it compatible with CI runners.

---

## Implemented Commands

| Category | Commands |
|---|---|
| Stack | `exch`, `pop`, `copy`, `dup`, `clear`, `count` |
| Arithmetic | `add`, `sub`, `mul`, `div`, `idiv`, `mod`, `abs`, `neg`, `ceiling`, `floor`, `round`, `sqrt` |
| Dictionary | `dict`, `begin`, `end`, `def`, `length`, `maxlength` |
| Strings | `length`, `get`, `getinterval`, `putinterval` |
| Boolean/Bitwise | `eq`, `ne`, `ge`, `gt`, `le`, `lt`, `and`, `or`, `not`, `true`, `false` |
| Flow Control | `if`, `ifelse`, `for`, `repeat`, `quit` |
| I/O | `print`, `=`, `==` |

---

## Unimplemented / Partially Implemented Commands

### `putinterval` — in-place mutation not possible

**Specification:** `putinterval` is defined to mutate the string in place.  
**Limitation:** JavaScript strings are immutable primitives. There is no way to modify a string at a specific index without creating a new string. The implementation returns a corrected new string instead of mutating the original, which means aliased references to the original string will not observe the change.  
**This is a genuine JavaScript language constraint**, not an omission. A workaround would require representing all PostScript strings as character arrays, which would require significant changes to how strings are pushed and consumed throughout the interpreter.

### `length` — overloaded operator dispatched by type

PostScript's `length` works on strings, dictionaries, arrays, and packed arrays. This interpreter supports `length` on strings and dictionaries. The dispatch is handled in the interpreter by peeking at the type of the top stack element and routing accordingly.

---

## Design Notes

### Why `def` lives in `Interpreter`, not `dictionary.js`

The `def` operator needs access to the interpreter's own `envStore` and `dictStack` to correctly capture the closure environment when lexical scoping is active. Placing it in `dictionary.js` would either require passing extra context or would silently drop the environment capture. It is intercepted directly in `execute()` before the dictionary dispatch table is checked.

### How lexical scoping works

When `def` is called in lexical mode, it stores the value alongside a deep copy of the current `dictStack`. When that procedure is later called, the interpreter temporarily restores that saved environment (plus a fresh local dict) before executing the procedure body, then restores the original environment afterward. This gives correct closure behavior.
