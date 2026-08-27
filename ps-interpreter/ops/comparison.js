// eq: any1 any2 => bool — true if both values are strictly equal
function eq(i){ let b=i.pop(); let a=i.pop(); i.push(a===b); }

// ne: any1 any2 => bool — true if values are not equal
function ne(i){ let b=i.pop(); let a=i.pop(); i.push(a!==b); }

// lt: num1|str1 num2|str2 => bool — true if a is less than b
function lt(i){ let b=i.pop(); let a=i.pop(); i.push(a<b); }

// gt: num1|str1 num2|str2 => bool — true if a is greater than b
function gt(i){ let b=i.pop(); let a=i.pop(); i.push(a>b); }

// le: num1|str1 num2|str2 => bool — true if a is less than or equal to b
function le(i){ let b=i.pop(); let a=i.pop(); i.push(a<=b); }

// ge: num1|str1 num2|str2 => bool — true if a is greater than or equal to b
function ge(i){ let b=i.pop(); let a=i.pop(); i.push(a>=b); }

module.exports = { eq, ne, lt, gt, le, ge };