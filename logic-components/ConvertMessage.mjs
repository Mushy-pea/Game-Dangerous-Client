import { readFileSync } from "node:fs";

function encodeLine(line) {
  let key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,'.?;:+-=!()<>".split("");
  let encodedLine = "";
  line.forEach((char) => {
    let encodedChar = key.findIndex((element) => {
      if (element === char) { return true }
      else { return false }
    }) + 1;
    encodedLine += `${encodedChar} `;
  });
  return encodedLine;
}

function encodeMessage(message) {
  let encodedMessage = "";
  message.forEach((line) => {
    encodedMessage += `${encodeLine(line.split(""))}\n`;
  });
  console.log(`Encoded message: ${encodedMessage}`);
}

function main() {
  const path = process.argv[2];
  const message = readFileSync(path, "utf8").split("\n");
  encodeMessage(message);
}

main();

