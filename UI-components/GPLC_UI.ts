import * as API_Types from "../API_Types.js";

function renderCode(source : API_Types.Token[], codeArea) : void {
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

export { renderCode };

