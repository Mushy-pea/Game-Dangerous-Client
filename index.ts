import * as ServerInterface from "./logic-components/ServerInterface.js";

type CursorPosition = {
  x : number,
  y : number
};

type GridPosition = {
  w : number,
  u : number,
  v : number
};

function captureCursor(canvas : HTMLCanvasElement, event : MouseEvent, position : CursorPosition)
                      : void {
  const rect = canvas.getBoundingClientRect();
  const x = event.pageX - rect.left;
  const y = event.pageY - rect.top;
  console.log(`x: ${x} y: ${y}`);
  position.x = x;
  position.y = y;
}

function mapCursorToGrid(position : CursorPosition, scale : number) : GridPosition {
  const u = Math.trunc(position.y / scale);
  const v = Math.trunc(position.x / scale);
  return {w: 0, u: u, v: v};
}

function drawGrid(gameBoard : CanvasRenderingContext2D,
                  xMax : number, yMax : number, scale : number) : void {
  let x = 0, y = 0;
  gameBoard.fillStyle = "rgb(0, 0, 192)";
  while (y <= yMax) {
    gameBoard.strokeRect(x * scale, y * scale, scale, scale);
    x ++;
    if (x > xMax) {
      x = 0;
      y ++;
    }
  }
}

function onVoxelHover(gameBoard : CanvasRenderingContext2D, cursorPosition : CursorPosition,
                      lastVoxelHovered : GridPosition, scale : number) : void {
  const gridPosition = mapCursorToGrid(cursorPosition, scale);
  if (gridPosition.u !== lastVoxelHovered.u || gridPosition.v !== lastVoxelHovered.v) {
    gameBoard.fillStyle = "rgb(0, 0, 192)";
    gameBoard.fillRect(gridPosition.v * scale, gridPosition.u * scale, scale, scale);
    gameBoard.fillStyle = "rgb(256, 256, 256)";
    gameBoard.fillRect(lastVoxelHovered.v * scale, lastVoxelHovered.u * scale, scale, scale);
    gameBoard.fillStyle = "rgb(0, 0, 192)";
    gameBoard.strokeRect(lastVoxelHovered.v * scale, lastVoxelHovered.u * scale, scale, scale);
    lastVoxelHovered.u = gridPosition.u;
    lastVoxelHovered.v = gridPosition.v;
  }
}

// function selectVoxel(gameBoard : CanvasRenderingContext2D,
//                      lastVoxelHovered : GridPosition, selectedVoxel : GridPosition) : void {
//   if ()
// }

const canvas = <HTMLCanvasElement>document.getElementById("gameBoard");
const gameBoard = canvas.getContext("2d");
const cursorPosition = {x: 0, y: 0};
const lastVoxelHovered = {w: 0, u: 0, v: 0};
const selectedVoxel = {w: 0, u: 0, v: 0};

document.onmousemove = event => captureCursor(canvas, event, cursorPosition);
//document.onmousedown
drawGrid(gameBoard, 9, 9, 128);
setInterval(onVoxelHover, 50, gameBoard, cursorPosition, lastVoxelHovered, 128);


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

