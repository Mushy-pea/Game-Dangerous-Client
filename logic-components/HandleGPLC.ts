import * as API_Types from "../API_Types.js";

type SymbolValue = {
  symbol: string,
  value: number,
  diff: number
};

const nullSymbolValue = {
  symbol: "null",
  value: 0,
  diff: 0
};

function readSourceValues(source : API_Types.Token[]) : SymbolValue[] {
  const initialValues : SymbolValue[] = Array(0);
  for (let i = source.length - 1; i >= 0; i -= 2) {
    if (source[i].content === "~") { break }
    initialValues.push({
      symbol: source[i].content,
      value: parseInt(source[i - 1].content),
      diff: 0
    });
  }
  return initialValues;
}

function readBytecodeValues(bytecode : number[], sourceValues : SymbolValue[]) : SymbolValue[] {
  const initialValues : SymbolValue[] = Array(0);
  let separatorCount = 0;
  let dataBlockIndex = 0;
  for (let i = 0; i < bytecode.length; i++) {
    if (bytecode[i] === 536870911) { separatorCount++ }
    else if (separatorCount === 2) {
      initialValues.push({
        symbol: sourceValues[dataBlockIndex].symbol,
        value: bytecode[i],
        diff: 0
      });
      dataBlockIndex++;
    }
  }
  return initialValues;
}

function compareValues(sourceValues : SymbolValue[], bytecodeValues : SymbolValue[])
                      : SymbolValue[] {
  const diff : SymbolValue[] = Array(0);
  for (let i = 0; i < bytecodeValues.length; i++) {
    diff.push({
      symbol: bytecodeValues[i].symbol,
      value: bytecodeValues[i].value,
      diff: bytecodeValues[i].value - sourceValues[i].value
    });
  }
  return diff;
}

 function checkProgramDiff(sourceProgram : API_Types.GPLC_Program,
                           deployedProgram : API_Types.ObjGrid) : SymbolValue[] | null {
  const deployedName = ((deployedProgram.programName).split(":"))[0];
  const deployedHash = ((deployedProgram.programName).split(":"))[1];
  if (deployedName === sourceProgram.name && deployedHash === sourceProgram.hash) {
    const sourceValues = readSourceValues(JSON.parse(sourceProgram.source));
    const bytecodeValues = readBytecodeValues(deployedProgram.program, sourceValues);
    const diff = compareValues(sourceValues, bytecodeValues);
    return diff;
  }
  else { return null }
}

//function mergeProgramDiff(source : API_Types.Token[], )

function formatCode(source : API_Types.Token[]) : string {
  let codeToRender = "";
  for (let i = source.length - 1; i >= 0; i--) {
    let tokenToRender = "";
    if (i < source.length - 1 && source[i].line > source[i + 1].line) {
      tokenToRender += "<br>";
    }
    tokenToRender += `<span style="color: ${source[i].textColour}">${source[i].content + " "}</span>`;
    codeToRender += tokenToRender;
  }
  return codeToRender;
}

export { checkProgramDiff, formatCode, SymbolValue, nullSymbolValue };

