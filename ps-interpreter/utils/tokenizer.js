function tokenize(input) {
  let tokens = [];
  let buffer = "";
  let stack  = [];

  for (let i = 0; i < input.length; i++) {
    let c = input[i];

    // ( ... ) — PostScript string literal.
    // Wrapped as { type: "string", value: "..." } so execute() can push the
    // value directly instead of mistaking it for a variable name.
    // Nested parens are handled via a depth counter.
    if (c === "(") {
      if (buffer.trim()) {
        tokens.push(parseAtom(buffer.trim()));
        buffer = "";
      }
      let str   = "";
      let depth = 1;
      i++;
      while (i < input.length && depth > 0) {
        if (input[i] === "(") depth++;
        else if (input[i] === ")") { depth--; if (depth === 0) break; }
        str += input[i];
        i++;
      }
      tokens.push({ type: "string", value: str });
    }

    // { — start of a procedure body; push current token list onto the stack
    else if (c === "{") {
      if (buffer.trim()) {
        tokens.push(parseAtom(buffer.trim()));
        buffer = "";
      }
      stack.push(tokens);
      tokens = [];
    }

    // } — end of a procedure body; wrap collected tokens as an array (the proc)
    else if (c === "}") {
      if (buffer.trim()) {
        tokens.push(parseAtom(buffer.trim()));
        buffer = "";
      }
      let proc = tokens;
      tokens   = stack.pop();
      tokens.push(proc);
    }

    // whitespace — flush the current buffer as a token
    else if (/\s/.test(c)) {
      if (buffer.trim()) {
        tokens.push(parseAtom(buffer.trim()));
        buffer = "";
      }
    }

    // any other character — accumulate into the buffer
    else {
      buffer += c;
    }
  }

  // flush any remaining buffer content
  if (buffer.trim()) {
    tokens.push(parseAtom(buffer.trim()));
  }

  return tokens;
}

// parseAtom: converts a raw string token to its typed value.
// "true"/"false" become booleans, numeric strings become numbers,
// everything else stays as a plain string (operator name or /name literal).
function parseAtom(t) {
  if (t === "true")  return true;
  if (t === "false") return false;
  if (!isNaN(t))     return Number(t);
  return t;
}

module.exports = tokenize;