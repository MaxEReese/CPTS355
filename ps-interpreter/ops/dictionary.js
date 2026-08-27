// dict: int => dict — creates a new empty dictionary with the given capacity
function dict(i) {
  let size = i.pop();
  i.push({ size, data: {}, type: "dict" });
}

// begin: dict => - — pushes the dictionary's data onto the dict stack, making it current
function begin(i) {
  let d = i.pop();
  i.dictStack.push(d.data);
}

// end: - => - — pops the top dictionary off the dict stack
function end(i) {
  i.dictStack.pop();
}

// dictlength: dict => int — returns the number of key-value pairs currently in the dictionary
function dictlength(i) {
  let d = i.pop();
  if (d && d.type === "dict") {
    i.push(Object.keys(d.data).length);
  } else if (typeof d === "string") {
    // fallback: length is overloaded in PostScript, handle strings here too
    i.push(d.length);
  } else {
    throw new Error("length: operand must be a dict or string");
  }
}

// maxlength: dict => int — returns the capacity the dictionary was created with
function maxlength(i) {
  let d = i.pop();
  if (d && d.type === "dict") {
    i.push(d.size);
  } else {
    throw new Error("maxlength: operand must be a dict");
  }
}

// Note: "def" is intentionally NOT exported here.
// It is handled directly by Interpreter.def() so that lexical scoping
// can correctly capture the closure environment at definition time.

module.exports = { dict, begin, end, dictlength, maxlength };