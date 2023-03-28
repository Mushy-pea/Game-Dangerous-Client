type Token = {
  line : number,
  column : number,
  content : string,
  textColour : string
};

function renderCode(tokenArr : Token[]) : void {
  console.log(`tokenArr length: ${tokenArr.length}`);
  const redText = '\u001b[31m';
  const greenText = '\u001b[32m';
  const blueText = '\u001b[36m';
  const whiteText = '\u001b[37m';
  const resetTextColour = '\u001b[39m';
  const clearScreen = '\u001b[2J';
  const placeCursor = (line : number, column : number) : string => {
    return `\u001b[${line};${column}H`;
  };
  const setColour = (textColour : string) : string => {
    if (textColour === 'Red') { return redText }
    else if (textColour === 'Green') { return greenText }
    else if (textColour === 'Blue') { return blueText }
    else if (textColour === 'White') { return whiteText }
    else { return resetTextColour }
  };

  let output = `${clearScreen}`;
  for (let i = 0; i < tokenArr.length; i++) {
    const token = tokenArr[i];
    output += `${placeCursor(token.line, token.column)}`;
    output += `${setColour(token.textColour)}`;
    output += `${token.content}`;
  }
  process.stdout.write(output);
  process.stdout.write(`${placeCursor(tokenArr[0].line + 2, 0)}`);
}

function main() {
  const fs = require("fs");
  const sourceFile = "C:\\Users\\steve\\code\\GD\\GPLC-scripts-and-maps\\CompilerOutput\\BulletPrototype.json";
  fs.readFile(sourceFile, "utf8", (err, source) => {
    if (err) {
      console.log(err);
      return;
    }
    else {
      let tokenArr = JSON.parse(source);
      renderCode(tokenArr);
    }
  });

}

main();

