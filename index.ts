import * as ServerInterface from "./logic-components/ServerInterface.js";
import * as GameBoard from "./UI-components/GameBoard.js";

async function main() {
  const mapDim = await ServerInterface.serverReadRequest({
    keyword: "metaData",
    arguments: ["null"]
  });
  const mapInterface = await ServerInterface.loadMap(
    mapDim.uMaxWall, mapDim.vMaxWall, mapDim.uMaxFloor, mapDim.vMaxFloor
  );

  // Test code to confirm that the client to server interface is working as expected.
  // console.log(`Wall_grid (0, 10, 10): ${JSON.stringify(mapInterface.getWallGrid(0, 10, 10))}`);
  // console.log(`Floor_grid (0, 5, 5): ${JSON.stringify(mapInterface.getFloorGrid(0, 5, 5))}`);
  // console.log(`Obj_grid (0, 10, 10): ${JSON.stringify(mapInterface.getObjGrid(0, 10, 10))}`);
  // const setSuccess0 = await mapInterface.setWallGridStructure(0, 10, 10, true, true, false, false);
  // if (setSuccess0 === false) { console.log("mapInterface.setWallGridStructure failed") }

  // const setSuccess1 = await mapInterface.setWallGridTextures(0, 10, 10, 128, 129, 130, 131);
  // if (setSuccess1 === false) { console.log("mapInterface.setWallGridTextures failed") }

  // const setSuccess2 = await mapInterface.setObjPlace(0, 10, 10, 132, 133, 134, 135, 136, 137, 138);
  // if (setSuccess2 === false) { console.log("mapInterface.setObjPlace failed") }
  
  // const setSuccess3 = await mapInterface.setFloorGrid(0, 5, 5, 139, "Open");
  // if (setSuccess3 === false) { console.log("mapInterface.setFloorGrid failed") }

  // const setSuccess4 = await mapInterface.setObjGrid(0, 10, 10, 3, [140, 141, 142, 143]);
  // if (setSuccess4 === false) { console.log("mapInterface.setObjGrid failed") }
  // console.log(`Wall_grid (0, 10, 10): ${JSON.stringify(mapInterface.getWallGrid(0, 10, 10))}`);
  // console.log(`Floor_grid (0, 5, 5): ${JSON.stringify(mapInterface.getFloorGrid(0, 5, 5))}`);
  // console.log(`Obj_grid (0, 10, 10): ${JSON.stringify(mapInterface.getObjGrid(0, 10, 10))}`);

  const canvas = <HTMLCanvasElement>document.getElementById("gameBoard");
  const gameBoard = canvas.getContext("2d");
  const cursorPosition = {x: 0, y: 0};
  const lastVoxelHovered = {w: 0, u: 0, v: 0};
  const selectedVoxel = {w: 0, u: 0, v: 0};
  const scale = 75;
  const gridOffset = {uMin: 0, uMax: 11, vMin: 0, vMax: 15};
  const wallHovered = {wall: "notWall"};

  document.onmousemove = event => GameBoard.captureCursor(canvas, event, cursorPosition);
  document.onmousedown = event => GameBoard.selectVoxel(gameBoard, mapInterface, gridOffset,
    lastVoxelHovered, selectedVoxel, wallHovered, scale);
  document.onkeydown = event => GameBoard.updateGridOffset(event, gridOffset, gameBoard,
    mapInterface, scale, mapDim.uMaxWall, mapDim.vMaxWall);
  GameBoard.drawGrid(gameBoard, mapInterface, gridOffset, 0, 0, scale, "iterative");
  setInterval(GameBoard.onVoxelHover, 40, gameBoard, mapInterface, gridOffset, lastVoxelHovered,
              selectedVoxel, wallHovered, cursorPosition, scale);
}

main();

