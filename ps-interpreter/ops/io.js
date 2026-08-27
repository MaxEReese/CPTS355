// print: string => - — writes the string to stdout with no trailing newline
function print(i) {
  process.stdout.write(String(i.pop()));
}

// =: any => - — writes the value's text representation to stdout followed by a newline
function eq_print(i) {
  console.log(String(i.pop()));
}

// ==: any => - — like =, but strings are wrapped in () to show PostScript representation
function eq_eq_print(i) {
  let v = i.pop();
  if (typeof v === "string") {
    console.log("(" + v + ")");
  } else if (Array.isArray(v)) {
    console.log("{ " + v.join(" ") + " }");
  } else {
    console.log(String(v));
  }
}

module.exports = { print, "=": eq_print, "==": eq_eq_print };