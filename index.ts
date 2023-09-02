import * as ServerInterface from "./logic-components/ServerInterface.js";

async function main() {
  const mapDim = await ServerInterface.serverReadRequest({
    keyword: "metaData",
    arguments: ["null"]
  });
  const mapInterface = await ServerInterface.loadMap(
    mapDim.uMaxWall, mapDim.vMaxWall, mapDim.uMaxFloor, mapDim.vMaxFloor
  );
  console.log(`Wall_grid (0, 10, 10): ${JSON.stringify(mapInterface.getWallGrid(0, 10, 10))}`);
  console.log(`Floor_grid (0, 5, 5): ${JSON.stringify(mapInterface.getFloorGrid(0, 5, 5))}`);
  console.log(`Obj_grid (0, 10, 10): ${JSON.stringify(mapInterface.getObjGrid(0, 10, 10))}`);
  const setSuccess0 = await mapInterface.setWallGridStructure(0, 10, 10, true, true, false, false);
  if (setSuccess0 === false) { console.log("mapInterface.setWallGridStructure failed") }

  const setSuccess1 = await mapInterface.setWallGridTextures(0, 10, 10, 128, 129, 130, 131);
  if (setSuccess1 === false) { console.log("mapInterface.setWallGridTextures failed") }

  const setSuccess2 = await mapInterface.setObjPlace(0, 10, 10, 132, 133, 134, 135, 136, 137, 138);
  if (setSuccess2 === false) { console.log("mapInterface.setObjPlace failed") }
  
  const setSuccess3 = await mapInterface.setFloorGrid(0, 5, 5, 139, "Open");
  if (setSuccess3 === false) { console.log("mapInterface.setFloorGrid failed") }

  const setSuccess4 = await mapInterface.setObjGrid(0, 10, 10, 3, [140, 141, 142, 143]);
  if (setSuccess4 === false) { console.log("mapInterface.setObjGrid failed") }
  
  console.log(`Wall_grid (0, 10, 10): ${JSON.stringify(mapInterface.getWallGrid(0, 10, 10))}`);
  console.log(`Floor_grid (0, 5, 5): ${JSON.stringify(mapInterface.getFloorGrid(0, 5, 5))}`);
  console.log(`Obj_grid (0, 10, 10): ${JSON.stringify(mapInterface.getObjGrid(0, 10, 10))}`);

}

main();

