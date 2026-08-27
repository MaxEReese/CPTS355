// add: num1 num2 => num1+num2 — adds two numbers
function add(i){ let b=i.pop(); let a=i.pop(); i.push(a+b); }

// sub: num1 num2 => num1-num2 — subtracts b from a
function sub(i){ let b=i.pop(); let a=i.pop(); i.push(a-b); }

// mul: num1 num2 => num1*num2 — multiplies two numbers
function mul(i){ let b=i.pop(); let a=i.pop(); i.push(a*b); }

// div: num1 num2 => num1/num2 — divides a by b, result may be a float
function div(i){ let b=i.pop(); let a=i.pop(); i.push(a/b); }

// idiv: int1 int2 => int(int1/int2) — integer division, truncates toward zero
function idiv(i){ let b=i.pop(); let a=i.pop(); i.push(Math.floor(a/b)); }

// mod: int1 int2 => int1%int2 — remainder after integer division
function mod(i){ let b=Math.floor(i.pop()); let a=Math.floor(i.pop()); i.push(a%b); }

// abs: num => |num| — absolute value
function abs(i){ i.push(Math.abs(i.pop())); }

// neg: num => -num — arithmetic negation
function neg(i){ i.push(-i.pop()); }

// ceiling: num => ceil(num) — smallest integer greater than or equal to num
function ceiling(i){ i.push(Math.ceil(i.pop())); }

// floor: num => floor(num) — largest integer less than or equal to num
function floor(i){ i.push(Math.floor(i.pop())); }

// round: num => round(num) — rounds to nearest integer (0.5 rounds up)
function round(i){ i.push(Math.round(i.pop())); }

// sqrt: num => sqrt(num) — square root
function sqrt(i){ i.push(Math.sqrt(i.pop())); }

module.exports = {
  add, sub, mul, div,
  idiv, mod,
  abs, neg,
  ceiling, floor, round, sqrt
};