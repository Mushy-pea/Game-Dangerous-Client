import * as API_Types from "../API_Types.js";
import * as ServerInterface from "./ServerInterface.js";

type SymbolValue = {
  symbol : string,
  value : number,
  diff : number
};

const nullSymbolValue = {
  symbol: "null",
  value: 0,
  diff: 0
};

type ConsoleState = {
  programSet : string[],
  programIndex : number,
  program : API_Types.GPLC_Program,
  programDiff : SymbolValue[]
};

const consoleState : ConsoleState = {
  programSet: [],
  programIndex: 0,
  program: null,
  programDiff: []
};

const nullConsoleState = {
  programSet: [],
  programIndex: -1,
  program: null,
  programDiff: []
};

function readSourceValues(source : API_Types.Token[]) : SymbolValue[] {
  const initialValues : SymbolValue[] = Array(0);
  for (let i = source.length - 1; i >= 0; i -= 3) {
    if (source[i].content === "~") { break }
    initialValues.push({
      symbol: source[i].content,
      value: parseInt(source[i - 2].content),
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

async function inspectProgram(obj : API_Types.ObjGrid)
                             : Promise<ConsoleState> {
  let deployedName;
  if (obj.programName === "null" || obj.programName === "") {
    return new Promise<ConsoleState>
    ((resolve) => { resolve(nullConsoleState) });
  }
  else {
    deployedName = ((obj.programName).split(":"))[0];
  }  
  let programSet;
  try {
    programSet = await ServerInterface.serverReadRequest({
      keyword: "GPLC",
      arguments: ["list", "null"]
    });
  }
  catch(error) {
    window.alert(`inspectProgram(point 1) : It appears there is a problem with the server : ${error}`);
    return new Promise<ConsoleState>((resolve, reject) => {
      reject(nullConsoleState);
    });
  }
  const i = programSet.findIndex((element) => {
    if (element === deployedName) { return true }
    else { return false }
  });
  let sourceProgram;
  try {
    if (i >= 0) {
      sourceProgram = await ServerInterface.getProgram(i);
    }
    else { throw new Error(`No matching program found.`) }
  }
  catch(error) {
    window.alert(`inspectProgram(point 2) : It appears there is a problem with the server : ${error}`);
    return new Promise<ConsoleState>((resolve, reject) => {
      reject(nullConsoleState);
    });
  }
  const diff = checkProgramDiff(sourceProgram, obj);
  return new Promise<ConsoleState>((resolve) => {
    if (diff !== null) {resolve({
      programSet: [],
      programIndex: i,
      program: sourceProgram,
      programDiff: diff
    })}
    else { resolve(nullConsoleState) }
  });
}

function addBlockAnnotation(oldBlockNumber : number, newBlockNumber : number) : string {
  let annotation = "<br>";
  if (newBlockNumber !== oldBlockNumber) { annotation += "<br>" }

  if (newBlockNumber === 0) { annotation += `<span>` }
  else if (newBlockNumber < 3) { annotation += `<span class="indentLevel1">` }
  else { annotation += `<span class="indentLevel2">` }
  return annotation;
}

function formatConsoleOutput(source : API_Types.Token[], diff : SymbolValue[], codeMode : boolean)
                            : string {
  let codeToRender = "<span>";
  let dataBlockIndex = 0;
  let dataBlockFlag = codeMode;
  let lastBlockNumber = source[source.length - 1].blockNumber;
  for (let i = source.length - 1; i >= 0; i--) {
    let tokenToRender = "";
    if (source[i].content === "~") { dataBlockFlag = false }

    if (dataBlockFlag === true && (source.length - i) % 3 === 0
        && diff[dataBlockIndex].diff !== 0) {
      source[i].content = `${diff[dataBlockIndex].value} (${diff[dataBlockIndex].diff})`;
      dataBlockIndex++;
    }
    else if (dataBlockFlag === true && (source.length - i) % 3 === 0) {
      dataBlockIndex++;
    }

    if (i < source.length - 1 && source[i].line > source[i + 1].line) {
      tokenToRender += "</span>";
      tokenToRender += addBlockAnnotation(lastBlockNumber, source[i].blockNumber);
      lastBlockNumber = source[i].blockNumber;
    }
    tokenToRender +=
      `<span style="color: ${source[i].textColour}">${source[i].content + " "}</span>`;
    codeToRender += tokenToRender;
  }
  return codeToRender += "</span>";
}

async function listPrograms() : Promise<string> {
  let programList;
  const programSet = Array(0);
  const output : API_Types.Token[] = Array(0);
  try {
    programList = await ServerInterface.serverReadRequest({
      keyword: "GPLC",
      arguments: ["list", "null"]
    });
  }
  catch(error) {
    window.alert(`listPrograms : It appears there is a problem with the server : ${error}`);
    return new Promise<string>((resolve) => { resolve("") });
  }
  output.push({
    line: 1,
    column: 0,
    content: "programSet:",
    textColour: "Black",
    blockNumber: 0
  });
  let line = 2;
  programList.forEach((programName) => {
    output.push({
      line: line,
      column: 0,
      content: programName,
      textColour: "Black",
      blockNumber: 0
    });
    programSet.push(programName);
    line++;
  });
  consoleState.programSet = programSet;
  return new Promise<string>((resolve) => { resolve(formatConsoleOutput(output.reverse(), [],
    false)) });
}

async function viewProgram(programName : string) : Promise<string> {
  const i = consoleState.programSet.findIndex((element) => {
    if (element === programName) { return true }
    else { return false }
  });
  if (i < 0) {
    window.alert(`viewProgram : ${programName} is not in the set of programs currently held by the server.`);
    return new Promise<string>((resolve) => { resolve("") });
  }
  let program;
  try {
    program = await ServerInterface.getProgram(i);
  }
  catch(error) {
    window.alert(`viewProgram : It appears there is a problem with the server : ${error}`);
    return new Promise<string>((resolve) => { resolve("") });
  }
  consoleState.programIndex = i;
  consoleState.program = program;
  consoleState.programDiff = readSourceValues(JSON.parse(program.source));
  return new Promise<string>((resolve) => {
    resolve(formatConsoleOutput(JSON.parse(consoleState.program.source), consoleState.programDiff,
      true));
  });
}

function patchProgram(symbol : string, value : number) : Promise<string> {
  const i = consoleState.programDiff.findIndex((element) => {
    if (element.symbol === symbol) { return true }
    else { return false }
  });
  if (i < 0) {
    window.alert(`patchProgram : ${symbol} is not a bound symbol in the scope of this program.`);
  }
  else {
    consoleState.programDiff[i].diff = value - consoleState.programDiff[i].value;
    consoleState.programDiff[i].value = value;
  }
  return new Promise<string>((resolve) => {
    resolve(formatConsoleOutput(JSON.parse(consoleState.program.source), consoleState.programDiff,
      true));
  });
}

function interpretConsole(input : string) : Promise<string> {
  const command = input.split(" ");
  const keyword = command[0];
  const arg1 = command[1];
  const arg2 = command[2];
  if (keyword === "listPrograms") {
    return listPrograms();
  }
  else if (keyword === "viewProgram") {
    return viewProgram(arg1);
  }
  else if (keyword === "patchProgram") {
    return patchProgram(arg1, parseInt(arg2));
  }
  else {
    return new Promise<string>((resolve) => {
      resolve("interpretConsole : Invalid keyword.");
    });
  }
  
}

export { inspectProgram, formatConsoleOutput, interpretConsole, SymbolValue, nullSymbolValue,
         consoleState, nullConsoleState };

