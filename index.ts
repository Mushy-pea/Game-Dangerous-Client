import * as GPLC_UI from "./UI-components/GPLC_UI.js";
import * as ServerInterface from "./logic-components/ServerInterface.js";

async function main() {
  const codeArea = document.getElementById("codeArea");
  const source = (await ServerInterface.getProgram(15)).source;
  const source_ = JSON.parse(source);
  GPLC_UI.renderCode(source_, codeArea);

  const wallGrid = await ServerInterface.loadMapLayer(0, 0, 0, 3, 3, "Wall_grid");
  const wallGrid_ = JSON.stringify(wallGrid);
  console.log(`wallGrid: ${wallGrid_}`);

  const floorGrid = await ServerInterface.loadMapLayer(0, 0, 0, 3, 3, "Floor_grid");
  const floorGrid_ = JSON.stringify(floorGrid);
  console.log(`floorGrid: ${floorGrid_}`);

  const objGrid = await ServerInterface.loadMapLayer(0, 0, 0, 3, 3, "Obj_grid");
  const objGrid_ = JSON.stringify(objGrid);
  console.log(`objGrid: ${objGrid_}`);

}

main();

