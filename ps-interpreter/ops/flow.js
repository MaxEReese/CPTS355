// if: bool proc => - — executes proc only if bool is true
function psIf(i) {
  let proc = i.pop();
  let cond = i.pop();
  if (cond === true) i.executeProcedure(proc);
}

// ifelse: bool proc1 proc2 => - — executes proc1 if bool is true, proc2 otherwise
function ifelse(i) {
  let proc2 = i.pop();
  let proc1 = i.pop();
  let cond  = i.pop();
  i.executeProcedure(cond ? proc1 : proc2);
}

// for: init step limit proc => - — runs proc for each value from init to limit by step,
// pushing the current counter onto the stack before each iteration
function psFor(i) {
  let proc  = i.pop();
  let limit = i.pop();
  let step  = i.pop();
  let init  = i.pop();

  if (step > 0) {
    for (let j = init; j <= limit; j += step) {
      i.push(j);
      i.executeProcedure(proc);
      if (i._quit) return;
    }
  } else if (step < 0) {
    // negative step counts down; loop condition is reversed
    for (let j = init; j >= limit; j += step) {
      i.push(j);
      i.executeProcedure(proc);
      if (i._quit) return;
    }
  }
  // step === 0 is undefined behaviour in PostScript, so we skip it
}

// repeat: n proc => - — executes proc exactly n times
function repeat(i) {
  let proc = i.pop();
  let n    = i.pop();
  for (let j = 0; j < n; j++) {
    i.executeProcedure(proc);
    if (i._quit) return;
  }
}

// quit: - => - — signals the interpreter to stop execution immediately
function quit(i) {
  i._quit = true;
}

module.exports = { if: psIf, ifelse, for: psFor, repeat, quit };