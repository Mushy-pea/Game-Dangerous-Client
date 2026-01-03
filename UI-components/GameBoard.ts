import * as API_Types from "../API_Types.js";
import { CursorPosition, GridPosition, GridOffset, VoxelPoints } from "./UI_Types.js";
import { inspectVoxel } from "./DataBox.js";

// This function handles the user inputs that control the field of view within the game board
// component, by updating the gridOffset object.
function updateGridOffset(event : KeyboardEvent, gridOffset : GridOffset,
                          gameBoard : CanvasRenderingContext2D,
                          mapInterface : API_Types.MapAccessor,
                          scale : number, mapU_Max : number, mapV_Max : number) : void {
  const step = 1;
  let new_W = gridOffset.w;
  let newU_Min = gridOffset.uMin;
  let newU_Max = gridOffset.uMax;
  let newV_Min = gridOffset.vMin;
  let newV_Max = gridOffset.vMax;
  if (event.key === "ArrowUp" && event.ctrlKey) {
    newU_Min -= step;
    newU_Max -= step;
  }
  else if (event.key === "ArrowDown" && event.ctrlKey) {
    newU_Min += step;
    newU_Max += step;
  }
  else if (event.key === "ArrowLeft" && event.ctrlKey) {
    newV_Min -= step;
    newV_Max -= step;
  }
  else if (event.key === "ArrowRight" && event.ctrlKey) {
    newV_Min += step;
    newV_Max += step;
  }
  else if (event.key === "+") { new_W ++ }
  else if (event.key === "_") { new_W -- }
  else { return }

  if (newU_Min < 0 || newU_Max > mapU_Max || newV_Min < 0 || newV_Max > mapV_Max ||
      new_W < 0 || new_W > 2) { return }
  else {
    gridOffset.w = new_W;
    gridOffset.uMin = newU_Min;
    gridOffset.uMax = newU_Max;
    gridOffset.vMin = newV_Min;
    gridOffset.vMax = newV_Max;
    gameBoard.fillStyle = "rgb(256, 256, 256)";
    gameBoard.fillRect(0, 0, scale * (gridOffset.vMax - gridOffset.vMin + 1),
      scale * (gridOffset.uMax - gridOffset.uMin + 1));
    drawGrid(gameBoard, mapInterface, gridOffset, 0, 0, scale, "iterative");
    const gameBoardViewPort = document.getElementById("gameBoardViewPort");
    gameBoardViewPort.innerText =
      `Game board viewport ((uMin, uMax), (vMin, vMax)): ((${gridOffset.uMin}, ${gridOffset.uMax}),\ 
(${gridOffset.vMin}, ${gridOffset.vMax}))`;
  }
}

// These four functions handle drawing the game board component grid.
function generateGrid(u : number, v : number, scale : number, gridOffset : GridOffset)
                     : VoxelPoints {
  return {
    boundary: [(v - gridOffset.vMin) * scale, (u - gridOffset.uMin) * scale, scale, scale],
    u1: [(v - gridOffset.vMin) * scale, (u - gridOffset.uMin) * scale, scale, scale * 0.2],
    u2: [(v - gridOffset.vMin) * scale, ((u - gridOffset.uMin) + 0.8) * scale, scale, 0.2 * scale],
    v1: [(v - gridOffset.vMin) * scale, (u - gridOffset.uMin) * scale, 0.2 * scale, scale],
    v2: [((v - gridOffset.vMin) + 0.8) * scale, (u - gridOffset.uMin) * scale, 0.2 * scale, scale]
  };
}

function colourCodeObjVoxel(gameBoard : CanvasRenderingContext2D, object : API_Types.ObjGrid) : void {
  if (object.objType === 0) {
    gameBoard.strokeStyle = "rgb(0, 0, 0)";
    gameBoard.fillStyle = "rgb(0, 0, 0)";
  }
  else if (object.objType === 1) {
    gameBoard.strokeStyle = "rgb(192, 0, 0)";
    gameBoard.fillStyle = "rgb(192, 0, 0)";
  }
  else if (object.objType === 2) {
    gameBoard.strokeStyle = "rgb(0, 0, 192)";
    gameBoard.fillStyle = "rgb(0, 0, 192)";
  }
  else if (object.objType === 3) {
    gameBoard.strokeStyle = "rgb(192, 0, 192)";
    gameBoard.fillStyle = "rgb(192, 0, 192)";
  }
  else if (object.objType === 4) {
    gameBoard.strokeStyle = "rgb(0, 0, 192)";
    gameBoard.fillStyle = "rgb(0, 0, 192)";
  }
}

function colourCodeFloorVoxel(gameBoard : CanvasRenderingContext2D, floor : API_Types.FloorGrid) {
  if (floor.surface === "Flat") {
    gameBoard.fillStyle = "rgb(255, 255, 255)"
  }
  else if (floor.surface === "Open") {
    gameBoard.fillStyle = "rgb(255, 150, 0)"
  }
  else if (floor.surface === "FlatMasked") {
    gameBoard.fillStyle = "rgb(150, 150, 255)"
  }
  else if (floor.surface === "OpenMasked") {
    gameBoard.fillStyle = "rgb(150, 255, 150)"
  }
  else if (floor.surface === "Positive_u" || floor.surface === "Negative_u") {
    gameBoard.fillStyle = "rgb(255, 128, 128)"
  }
  else {
    gameBoard.fillStyle = "rgb(255, 255, 128)"
  }
}

function drawGrid(gameBoard : CanvasRenderingContext2D, mapInterface : API_Types.MapAccessor,
                  gridOffset : GridOffset | null, singleU : number, singleV : number,
                  scale : number, mode : string) : void {
  function drawVoxel(points : VoxelPoints, wall : API_Types.WallGrid, object : API_Types.ObjGrid,
                     floor : API_Types.FloorGrid) : void {
    colourCodeFloorVoxel(gameBoard, floor);
    gameBoard.fillRect(points.boundary[0], points.boundary[1],
                       points.boundary[2], points.boundary[3]);
    colourCodeObjVoxel(gameBoard, object);
    if (wall.u1_structure) {
      gameBoard.fillRect(points.u1[0], points.u1[1], points.u1[2], points.u1[3]);
    }
    else {
      gameBoard.strokeRect(points.u1[0], points.u1[1], points.u1[2], points.u1[3]);
    }
    if (wall.u2_structure) {
      gameBoard.fillRect(points.u2[0], points.u2[1], points.u2[2], points.u2[3]);
    }
    else {
      gameBoard.strokeRect(points.u2[0], points.u2[1], points.u2[2], points.u2[3]);
    }
    if (wall.v1_structure) {
      gameBoard.fillRect(points.v1[0], points.v1[1], points.v1[2], points.v1[3]);
    }
    else {
      gameBoard.strokeRect(points.v1[0], points.v1[1], points.v1[2], points.v1[3]);
    }
    if (wall.v2_structure) {
      gameBoard.fillRect(points.v2[0], points.v2[1], points.v2[2], points.v2[3]);
    }
    else {
      gameBoard.strokeRect(points.v2[0], points.v2[1], points.v2[2], points.v2[3]);
    }
  }

  if (mode === "iterative") {
    let u = gridOffset.uMin, v = gridOffset.vMin;
    while (u <= gridOffset.uMax) {
      const points = generateGrid(u, v, scale, gridOffset);
      const wall : API_Types.WallGrid = mapInterface.getWallGrid(gridOffset.w, u, v);
      const object : API_Types.ObjGrid = mapInterface.getObjGrid(gridOffset.w, u, v);
      const floor : API_Types.FloorGrid = mapInterface.getFloorGrid(gridOffset.w, Math.floor(u / 2),
                                                                    Math.floor(v / 2));
      if (wall !== null) {
        drawVoxel(points, wall, object, floor);
      }
      v++;
      if (v > gridOffset.vMax) {
        v = 0;
        u++;
      }
    }
  }
  else {
    const points = generateGrid(singleU, singleV, scale, gridOffset);
    const wall : API_Types.WallGrid = mapInterface.getWallGrid(gridOffset.w, singleU, singleV);
    const object : API_Types.ObjGrid = mapInterface.getObjGrid(gridOffset.w, singleU, singleV);
    const floor : API_Types.FloorGrid = mapInterface.getFloorGrid(gridOffset.w, Math.floor(singleU / 2),
                                                                  Math.floor(singleV / 2));
    colourCodeObjVoxel(gameBoard, object);
    if (wall !== null) {
      drawVoxel(points, wall, object, floor);
    }
  }
}

// By passing the appropriate scale argument to mapCursorToGrid, the cursor positions returned by
// captureCursor can be mapped to either a voxel on the game board or a wall element within a voxel.
function captureCursor(canvas : HTMLCanvasElement, event : MouseEvent, position : CursorPosition)
                      : void {
  const rect = canvas.getBoundingClientRect();
  const x = event.pageX - rect.left;
  const y = event.pageY - rect.top;
  position.x = x;
  position.y = y;
}

function mapCursorToGrid(position : CursorPosition, scale : number) : GridPosition {
  const u = Math.trunc(position.y / scale);
  const v = Math.trunc(position.x / scale);
  return {w: 0, u: u, v: v, outOfBounds: false};
}

// This function maps the cursor position to a wall element within a voxel.
function findWallHovered(voxelHovered : GridPosition, gridOffset : GridOffset,
                         cursorPosition : CursorPosition, scale : number) : string {
  function isSamePos(position : GridPosition, u : number, v : number) : boolean {
    if (position.u === u && position.v === v) { return true }
    else { return false }
  }

  const innerPos = mapCursorToGrid(cursorPosition, scale * 0.2);
  innerPos.u += gridOffset.uMin * 5;
  innerPos.v += gridOffset.vMin * 5;
  innerPos.u -= voxelHovered.u * 5;
  innerPos.v -= voxelHovered.v * 5;
  if (isSamePos(innerPos, 0, 1) || isSamePos(innerPos, 0, 2) || isSamePos(innerPos, 0, 3)) {
    return "u1";
  }
  else if (isSamePos(innerPos, 1, 4) || isSamePos(innerPos, 2, 4) || isSamePos(innerPos, 3, 4)) {
    return "v2";
  }
  else if (isSamePos(innerPos, 4, 3) || isSamePos(innerPos, 4, 2) || isSamePos(innerPos, 4, 1)) {
    return "u2";
  }
  else if (isSamePos(innerPos, 3, 0) || isSamePos(innerPos, 2, 0) || isSamePos(innerPos, 1, 0)) {
    return "v1";
  }
  else {
    return "notWall";
  }
}

// This function maps the cursor position to a voxel on the game board and updates lastVoxelHovered,
// which is key to the voxel hovering and selection actions in the UI.
function onVoxelHover(gameBoard : CanvasRenderingContext2D, mapInterface : API_Types.MapAccessor,
                      gridOffset : GridOffset, lastVoxelHovered : GridPosition,
                      selectedVoxel : GridPosition, wallHovered : {wall : string},
                      cursorPosition : CursorPosition, scale : number)
                     : void {
  const gridPosition = mapCursorToGrid(cursorPosition, scale);
  const gridPositionRend = {u: gridPosition.u, v: gridPosition.v};
  const lastVoxelHoveredRend = {
    u: lastVoxelHovered.u - gridOffset.uMin,
    v: lastVoxelHovered.v - gridOffset.vMin
  };
  const selectedVoxelRend = {
    u: selectedVoxel.u - gridOffset.uMin,
    v: selectedVoxel.v - gridOffset.vMin
  };
  gridPosition.u += gridOffset.uMin;
  gridPosition.v += gridOffset.vMin;
  if (gridPosition.u < 0 || gridPosition.u > gridOffset.uMax ||
      gridPosition.v < 0 || gridPosition.v > gridOffset.vMax) {
    lastVoxelHovered.outOfBounds = true;
    return;
  }

  if (gridPosition.u !== lastVoxelHovered.u || gridPosition.v !== lastVoxelHovered.v) {
    gameBoard.fillStyle = "rgba(0, 0, 192, 0.5)";
    gameBoard.fillRect(gridPositionRend.v * scale, gridPositionRend.u * scale, scale, scale);
    gameBoard.fillStyle = "rgb(256, 256, 256)";
    gameBoard.fillRect(lastVoxelHoveredRend.v * scale, lastVoxelHoveredRend.u * scale, scale,
      scale);
    gameBoard.fillStyle = "rgb(0, 0, 192)";
    drawGrid(gameBoard, mapInterface, gridOffset, lastVoxelHovered.u, lastVoxelHovered.v, scale,
      "singular");
    gameBoard.fillStyle = "rgb(256, 256, 256)";
    gameBoard.fillRect(selectedVoxelRend.v * scale, selectedVoxelRend.u * scale, scale, scale);
    gameBoard.fillStyle = "rgb(0, 0, 192)";
    drawGrid(gameBoard, mapInterface, gridOffset, selectedVoxel.u, selectedVoxel.v, scale,
             "singular");
    gameBoard.fillStyle = "rgba(0, 192, 0, 0.5)";
    gameBoard.fillRect(selectedVoxelRend.v * scale, selectedVoxelRend.u * scale, scale, scale);
    lastVoxelHovered.u = gridPosition.u;
    lastVoxelHovered.v = gridPosition.v;

    const voxelHovered = document.getElementById("voxelHovered");
    voxelHovered.innerText =
      `Cursor is over voxel (w, u, v): (${gridOffset.w}, ${lastVoxelHovered.u}, ${lastVoxelHovered.v})`;
  }
  wallHovered.wall = findWallHovered(lastVoxelHovered, gridOffset, cursorPosition, scale);
  lastVoxelHovered.outOfBounds = false;
}

// This function implements the UI actions for selecting an active voxel on the game board and
// changing the state of a wall element within it.
async function selectVoxel(gameBoard : CanvasRenderingContext2D,
                           mapInterface : API_Types.MapAccessor,
                           gridOffset : GridOffset, lastVoxelHovered : GridPosition,
                           selectedVoxel : GridPosition, wallGridMirrorSwitch : boolean,
                           wallHovered : {wall : string}, scale : number) : Promise<boolean> {
  if (lastVoxelHovered.outOfBounds === true) { return }
  const lastVoxelHoveredRend = {
    u: lastVoxelHovered.u - gridOffset.uMin,
    v: lastVoxelHovered.v - gridOffset.vMin
  };
  const selectedVoxelRend = {
    u: selectedVoxel.u - gridOffset.uMin,
    v: selectedVoxel.v - gridOffset.vMin
  };
  gameBoard.fillStyle = "rgba(0, 192, 0, 0.5)";
  gameBoard.fillRect(lastVoxelHoveredRend.v * scale, lastVoxelHoveredRend.u * scale, scale, scale);
  gameBoard.fillStyle = "rgb(256, 256, 256)";
  gameBoard.fillRect(selectedVoxelRend.v * scale, selectedVoxelRend.u * scale, scale, scale);
  gameBoard.fillStyle = "rgb(0, 0, 192)";
  drawGrid(gameBoard, mapInterface, gridOffset, selectedVoxel.u, selectedVoxel.v, scale,
    "singular");
  selectedVoxel.w = gridOffset.w;
  selectedVoxel.u = lastVoxelHovered.u;
  selectedVoxel.v = lastVoxelHovered.v;
  if (wallHovered.wall !== "notWall") {
    const thisVoxel = mapInterface.getWallGrid(selectedVoxel.w, selectedVoxel.u, selectedVoxel.v);
    let u1 = thisVoxel.u1_structure, u2 = thisVoxel.u2_structure, v1 = thisVoxel.v1_structure,
    v2 = thisVoxel.v2_structure;
    if (wallHovered.wall === "u1") { u1 =! u1 }
    else if (wallHovered.wall === "u2") { u2 =! u2 }
    else if (wallHovered.wall === "v1") { v1 =! v1 }
    else { v2 =! v2 }
    let success;
    try {
      success = await mapInterface.setWallGridStructure(selectedVoxel.w, selectedVoxel.u,
        selectedVoxel.v, u1, u2, v1, v2);
    }
    catch(error) {
      console.log(`setWallGridStructure : failed : ${error}`);
    }
    if (success) {
      drawGrid(gameBoard, mapInterface, gridOffset, selectedVoxel.u, selectedVoxel.v, scale,
               "singular");
    }
    else {
      return new Promise<boolean>((resolve, reject) => {reject(false)});
    }
  }
  inspectVoxel(mapInterface, selectedVoxel, wallGridMirrorSwitch);
  return new Promise<boolean>((resolve, reject) => {resolve(true)});
}

export { updateGridOffset, captureCursor, drawGrid, onVoxelHover, selectVoxel };

