type Token = {
  line : number,
  column : number,
  content : string,
  textColour : string
};

type Command = {
  keyword : string,
  arguments : string[]
};

type GPLC_Program = {
  name : string,
  hash : string,
  source : string,
  bytecode : string
};

async function getProgram(fileIndex : Number) : Promise<GPLC_Program> {
  const baseURL = "http://localhost/command";
  const command : Command = {
    keyword: "GPLC",
    arguments: ["query", `${fileIndex}`]
  };
  const commandStr = JSON.stringify(command);
  const response = await fetch(baseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: commandStr
  });
  const program = await response.json();
  const result = new Promise<GPLC_Program>((resolve, reject) => {
    if (response.status === 200) {
      resolve({
        name: program.name,
        hash: program.hash,
        source: program.source,
        bytecode: program.bytecode
      });
    }
    else {
      reject(null)
    }
  });
  return result;
}
  
function renderCode(source : Token[], codeArea) : void {
  for (let i = source.length - 1; i >= 0; i--) {
    const renderedToken = document.createElement("span");
    renderedToken.innerHTML = `${source[i].content + " "}`;
    renderedToken.setAttribute("style", `color: ${source[i].textColour}`);
    if (i < source.length - 1 && source[i].line > source[i + 1].line) {
      const br = document.createElement("br");
      codeArea.appendChild(br);
    }
    codeArea.appendChild(renderedToken);
  }
}

export { Token, Command, GPLC_Program, getProgram, renderCode };

