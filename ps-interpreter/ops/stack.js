// dup: any => any any — duplicates the top value on the stack
function dup(i){ let v=i.pop(); i.push(v); i.push(v); }

// pop: any => - — discards the top value
function pop(i){ i.pop(); }

// exch: a b => b a — swaps the top two values
function exch(i){
  let b=i.pop();
  let a=i.pop();
  i.push(b);
  i.push(a);
}

// clear: ... => - — removes all values from the stack
function clear(i){ i.stack=[]; }

// count: ... => ... n — pushes the number of items currently on the stack
function count(i){ i.push(i.stack.length); }

// copy: any[0]..any[n-1] n => any[0]..any[n-1] any[0]..any[n-1] — duplicates the top n items
function copy(i){
  let n=i.pop();
  let slice=i.stack.slice(-n);
  for (let v of slice) i.push(v);
}

module.exports = { dup, pop, exch, clear, count, copy };