import * as ServerInterface from "./logic-components/ServerInterface.js";

async function main() {
  const mapInterface = await ServerInterface.loadMap(39, 53, 19, 26);
  console.log(`Wall_grid (0, 10, 10): ${JSON.stringify(mapInterface.getWallGrid(0, 10, 10))}`);
  console.log(`Floor_grid (0, 5, 5): ${JSON.stringify(mapInterface.getFloorGrid(0, 5, 5))}`);
  console.log(`Obj_grid (0, 10, 10): ${JSON.stringify(mapInterface.getObjGrid(0, 10, 10))}`);
}

main();

