// Boolean and bitwise operations.
// Each operator works on both booleans (logical) and integers (bitwise).

// and: bool1|int1 bool2|int2 => bool|int — logical AND for booleans, bitwise AND for integers
function and(i) {
  let b = i.pop();
  let a = i.pop();
  if (typeof a === "boolean" && typeof b === "boolean") {
    i.push(a && b);
  } else {
    i.push((a & b) | 0); // bitwise AND, result as 32-bit int
  }
}

// or: bool1|int1 bool2|int2 => bool|int — logical OR for booleans, bitwise OR for integers
function or(i) {
  let b = i.pop();
  let a = i.pop();
  if (typeof a === "boolean" && typeof b === "boolean") {
    i.push(a || b);
  } else {
    i.push((a | b) | 0); // bitwise OR, result as 32-bit int
  }
}

// not: bool|int => bool|int — logical NOT for booleans, bitwise NOT for integers
function not(i) {
  let a = i.pop();
  if (typeof a === "boolean") {
    i.push(!a);
  } else {
    i.push(~a | 0); // bitwise NOT, result as 32-bit int
  }
}

module.exports = { and, or, not };