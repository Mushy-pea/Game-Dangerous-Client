import * as API_Types from "../API_Types.js";

type CursorPosition = {
  x : number,
  y : number
};

type GridPosition = {
  w : number,
  u : number,
  v : number
};

type GridOffset = {
  uMin : number,
  uMax : number,
  vMin : number,
  vMax : number
};

type VoxelPoints = {
  boundary : number[],
  u1 : number[],
  u2 : number[],
  v1 : number[],
  v2 : number[]
};

function updateGridOffset(event : KeyboardEvent, gridOffset : GridOffset,
                          gameBoard : CanvasRenderingContext2D,
                          mapInterface : API_Types.MapAccessor,
                          scale : number, mapU_Max : number, mapV_Max : number) : void {
  const step = 2;
  let newU_Min = gridOffset.uMin;
  let newU_Max = gridOffset.uMax;
  let newV_Min = gridOffset.vMin;
  let newV_Max = gridOffset.vMax;
  if (event.code === "KeyW") {
    newU_Min -= step;
    newU_Max -= step;
  }
  else if (event.code === "KeyS") {
    newU_Min += step;
    newU_Max += step;
  }
  else if (event.code === "KeyA") {
    newV_Min -= step;
    newV_Max -= step;
  }
  else if (event.code === "KeyD") {
    newV_Min += step;
    newV_Max += step;
  }
  else { return }

  if (newU_Min < 0 || newU_Max > mapU_Max || newV_Min < 0 || newV_Max > mapV_Max) { return }
  else {
    gridOffset.uMin = newU_Min;
    gridOffset.uMax = newU_Max;
    gridOffset.vMin = newV_Min;
    gridOffset.vMax = newV_Max;
    gameBoard.fillStyle = "rgb(256, 256, 256)";
    gameBoard.fillRect(0, 0, scale * 16, scale * 12);
    drawGrid(gameBoard, mapInterface, gridOffset, 0, 0, scale, "iterative");
  }
}

// These two functions handle drawing the game board component grid.
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

function drawGrid(gameBoard : CanvasRenderingContext2D, mapInterface : API_Types.MapAccessor,
                  gridOffset : GridOffset | null, singleU : number, singleV : number,
                  scale : number, mode : string) : void {
  function drawVoxel(points : VoxelPoints, voxel : API_Types.WallGrid) : void {
    gameBoard.strokeRect(points.boundary[0], points.boundary[1],
                         points.boundary[2], points.boundary[3]);
    if (voxel.u1_structure) {
      gameBoard.fillRect(points.u1[0], points.u1[1], points.u1[2], points.u1[3]);
    }
    else {
      gameBoard.strokeRect(points.u1[0], points.u1[1], points.u1[2], points.u1[3]);
    }
    if (voxel.u2_structure) {
      gameBoard.fillRect(points.u2[0], points.u2[1], points.u2[2], points.u2[3]);
    }
    else {
      gameBoard.strokeRect(points.u2[0], points.u2[1], points.u2[2], points.u2[3]);
    }
    if (voxel.v1_structure) {
      gameBoard.fillRect(points.v1[0], points.v1[1], points.v1[2], points.v1[3]);
    }
    else {
      gameBoard.strokeRect(points.v1[0], points.v1[1], points.v1[2], points.v1[3]);
    }
    if (voxel.v2_structure) {
      gameBoard.fillRect(points.v2[0], points.v2[1], points.v2[2], points.v2[3]);
    }
    else {
      gameBoard.strokeRect(points.v2[0], points.v2[1], points.v2[2], points.v2[3]);
    }
  }

  if (mode === "iterative") {
    let u = gridOffset.uMin, v = gridOffset.vMin;
    gameBoard.strokeStyle = "rgb(0, 0, 192)";
    gameBoard.fillStyle = "rgb(0, 0, 192)";
    while (u <= gridOffset.uMax) {
      const points = generateGrid(u, v, scale, gridOffset);
      const voxel : API_Types.WallGrid = mapInterface.getWallGrid(0, u, v);
      drawVoxel(points, voxel);
      v++;
      if (v > gridOffset.vMax) {
        v = 0;
        u++;
      }
    }
  }
  else {
    const points = generateGrid(singleU, singleV, scale, gridOffset);
    const voxel : API_Types.WallGrid = mapInterface.getWallGrid(0, singleU, singleV);
    drawVoxel(points, voxel);
  }
}

// These four functions manage a UI interaction whereby the user can select the active voxel
// on the grid.
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
  return {w: 0, u: u, v: v};
}

function onVoxelHover(gameBoard : CanvasRenderingContext2D, mapInterface : API_Types.MapAccessor,
                      gridOffset : GridOffset, lastVoxelHovered : GridPosition,
                      selectedVoxel : GridPosition, cursorPosition : CursorPosition, scale : number)
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
  console.log(`gridPosition.u: ${gridPosition.u} gridPosition.v: ${gridPosition.v}`);
  console.log(`lastVoxelHovered.u: ${lastVoxelHovered.u} lastVoxelHovered.v: ${lastVoxelHovered.v}`);
  if (gridPosition.u !== lastVoxelHovered.u || gridPosition.v !== lastVoxelHovered.v) {
    gameBoard.fillStyle = "rgba(0, 0, 192, 0.5)";
    gameBoard.fillRect(gridPositionRend.v * scale, gridPositionRend.u * scale, scale, scale);
    gameBoard.fillStyle = "rgb(256, 256, 256)";
    gameBoard.fillRect(lastVoxelHoveredRend.v * scale, lastVoxelHoveredRend.u * scale, scale, scale);
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
  }
}

function selectVoxel(gameBoard : CanvasRenderingContext2D, mapInterface : API_Types.MapAccessor,
                     gridOffset : GridOffset, lastVoxelHovered : GridPosition,
                     selectedVoxel : GridPosition, scale : number)
                    : void {
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
  drawGrid(gameBoard, mapInterface, gridOffset, selectedVoxel.u, selectedVoxel.v, scale, "singular");
  selectedVoxel.u = lastVoxelHovered.u;
  selectedVoxel.v = lastVoxelHovered.v;
  console.log(`selectedVoxel.u: ${selectedVoxel.u} selectedVoxel.v: ${selectedVoxel.v}`);
}

export { updateGridOffset, captureCursor, drawGrid, onVoxelHover, selectVoxel };

