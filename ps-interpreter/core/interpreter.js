const arith    = require("../ops/arithmetic");
const stackOps = require("../ops/stack");
const cmp      = require("../ops/comparison");
const bool     = require("../ops/boolean");
const io       = require("../ops/io");
const dict     = require("../ops/dictionary");
const str      = require("../ops/strings");
const flow     = require("../ops/flow");

class Interpreter {
  constructor() {
    this.stack     = [];
    this.dictStack = [{}];   // stack of dictionaries; index 0 is the global dict
    this.scoping   = "dynamic";
    this.envStore  = {};     // lexical only: maps name -> { value, env snapshot }
    this._quit     = false;  // set by quit to stop execution cleanly
  }

  // setScoping: switches between "dynamic" and "lexical" scoping modes
  setScoping(mode) {
    if (mode !== "dynamic" && mode !== "lexical") {
      throw new Error("Invalid scoping mode");
    }
    this.scoping = mode;
  }

  // push: puts a value on top of the operand stack
  push(v) {
    this.stack.push(v);
  }

  // pop: removes and returns the top value; throws on underflow
  pop() {
    if (this.stack.length === 0) throw new Error("Stack underflow");
    return this.stack.pop();
  }

  // topDict: returns the dictionary currently at the top of the dict stack
  topDict() {
    return this.dictStack[this.dictStack.length - 1];
  }

  // lookup: searches the dict stack from top to bottom for a variable name.
  // In lexical mode, executeProcedure restores the captured env before running
  // a procedure body, so the correct version of each variable is already in
  // dictStack by the time lookup is called — no special case needed here.
  lookup(name) {
    for (let i = this.dictStack.length - 1; i >= 0; i--) {
      if (name in this.dictStack[i]) return this.dictStack[i][name];
    }
    throw new Error("Undefined variable: " + name);
  }

  // def: /key value => - — binds a name to a value in the current dictionary.
  // In lexical mode, also snapshots the full dict stack so closures work correctly.
  def() {
    let value = this.pop();
    let key   = this.pop();

    if (typeof key === "string" && key.startsWith("/")) {
      key = key.slice(1);
    }

    // unwrap string literal objects used as keys (rare but valid PostScript)
    if (key && key.type === "string") key = key.value;

    // always write into the current dict so lookup() can find it
    this.topDict()[key] = value;

    if (this.scoping === "lexical") {
      // snapshot each dict frame so future redefinitions don't affect this closure
      this.envStore[key] = {
        value,
        env: this.dictStack.map(d => ({ ...d }))
      };
    }
  }

  // executeProcedure: runs an array of tokens as a procedure.
  // If closureEnv is provided (lexical mode), the saved environment is restored
  // for the duration of the call, then the original dict stack is put back.
  executeProcedure(proc, closureEnv) {
    if (closureEnv) {
      let saved = this.dictStack;
      // deep-copy each frame to prevent mutation during execution
      this.dictStack = [...closureEnv.map(d => ({ ...d })), {}];
      for (let t of proc) {
        this.execute(t);
        if (this._quit) break;
      }
      this.dictStack = saved;
    } else {
      for (let t of proc) {
        this.execute(t);
        if (this._quit) break;
      }
    }
  }

  // execute: dispatches a single token to the appropriate handler
  execute(token) {
    if (this._quit) return;

    // literals — push directly onto the operand stack
    if (typeof token === "number")         return this.push(token);
    if (token === true || token === false) return this.push(token);
    if (Array.isArray(token))              return this.push(token); // unevaluated procedure

    // { type: "string", value: "..." } — string literal from the tokenizer;
    // push the raw value without looking it up as a variable name
    if (token && token.type === "string")  return this.push(token.value);

    // "def" is intercepted before the dict dispatch table so Interpreter.def()
    // always runs — it handles both scoping modes and captures closure envs
    if (token === "def") return this.def();

    // "length" is overloaded: dispatch to dictlength for dicts, strings.length otherwise
    if (token === "length") {
      let top = this.stack[this.stack.length - 1];
      if (top && top.type === "dict") return dict.dictlength(this);
      return str.length(this);
    }

    // operator dispatch tables
    if (arith[token])    return arith[token](this);
    if (stackOps[token]) return stackOps[token](this);
    if (cmp[token])      return cmp[token](this);
    if (bool[token])     return bool[token](this);
    if (io[token])       return io[token](this);
    if (dict[token])     return dict[token](this);
    if (str[token])      return str[token](this);
    if (flow[token])     return flow[token](this);

    if (typeof token === "string") {
      // /name — push the literal name string onto the stack (used by def)
      if (token.startsWith("/")) {
        this.push(token);
        return;
      }

      // lexical mode: if this name has a captured closure env and its value is
      // a procedure, restore that env before executing the body
      if (this.scoping === "lexical" && this.envStore[token] !== undefined) {
        let entry = this.envStore[token];
        if (Array.isArray(entry.value)) {
          this.executeProcedure(entry.value, entry.env);
          return;
        }
        // non-procedure: fall through to normal dictStack lookup below
      }

      // look up the name and either call it (if a procedure) or push its value
      let val = this.lookup(token);
      if (Array.isArray(val)) return this.executeProcedure(val);
      this.push(val);
      return;
    }

    throw new Error("Unknown token: " + token);
  }

  // run: executes a list of tokens, stopping early if quit was called
  run(tokens) {
    for (let t of tokens) {
      this.execute(t);
      if (this._quit) break;
    }
  }
}

module.exports = Interpreter;