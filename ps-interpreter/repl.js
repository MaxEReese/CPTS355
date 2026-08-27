const readline = require("readline");
const Interpreter = require("./core/interpreter");
const tokenize = require("./utils/tokenizer");

const ps = new Interpreter();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

console.log("REPL ready (exit to quit)");
rl.prompt();

rl.on("line", line => {
  if (line.trim() === "exit") {
    rl.close();
    return;
  }

  if (line.startsWith(":scope")) {
    const mode = line.split(" ")[1];
    try {
      ps.setScoping(mode);
      console.log("Scoping set to:", mode);
    } catch (e) {
      console.error(e.message);
    }
    rl.prompt();
    return;
  }

  try {
    ps.run(tokenize(line));
  } catch (e) {
    console.error(e.message);
  }

  rl.prompt();
});