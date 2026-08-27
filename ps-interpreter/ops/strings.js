// length: string => int — returns the number of characters in the string
function length(i){
  let s=i.pop();
  i.push(s.length);
}

// get: string index => char — returns the character at the given index
function get(i){
  let idx=i.pop();
  let s=i.pop();
  i.push(s[idx]);
}

// getinterval: string index count => substring — returns count characters starting at index
function getinterval(i){
  let count=i.pop();
  let idx=i.pop();
  let s=i.pop();
  i.push(s.substring(idx, idx+count));
}

// putinterval: string index replacement => result — replaces characters in string starting
// at index with replacement. Note: JS strings are immutable so a new string is returned
// rather than mutating in place (unavoidable language limitation).
function putinterval(i){
  let rep=i.pop();
  let idx=i.pop();
  let s=i.pop();
  i.push(s.slice(0,idx)+rep+s.slice(idx+rep.length));
}

module.exports = { length, get, getinterval, putinterval };