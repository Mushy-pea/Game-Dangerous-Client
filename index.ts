import * as RenderGPLC from "./RenderGPLC.js";

async function main() {
  const codeArea = document.getElementById("codeArea");
  const source = (await RenderGPLC.getProgram(15)).source;
  const source_ = JSON.parse(source);
  RenderGPLC.renderCode(source_, codeArea);
}

main();

