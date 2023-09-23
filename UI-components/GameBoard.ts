type CursorPosition = {
  x : number,
  y : number
};

type GridPosition = {
  w : number,
  u : number,
  v : number
};

// This function draws the game board component grid.
function drawGrid(gameBoard : CanvasRenderingContext2D,
                  xMax : number, yMax : number, scale : number) : void {
  let x = 0, y = 0;
  gameBoard.strokeStyle = "rgb(0, 0, 192)";
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

function onVoxelHover(gameBoard : CanvasRenderingContext2D, cursorPosition : CursorPosition,
                      lastVoxelHovered : GridPosition, selectedVoxel : GridPosition, scale : number)
                      : void {
  const gridPosition = mapCursorToGrid(cursorPosition, scale);
  if (gridPosition.u !== lastVoxelHovered.u || gridPosition.v !== lastVoxelHovered.v) {
    gameBoard.fillStyle = "rgb(0, 0, 192)";
    gameBoard.fillRect(gridPosition.v * scale, gridPosition.u * scale, scale, scale);
    gameBoard.fillStyle = "rgb(256, 256, 256)";
    gameBoard.fillRect(lastVoxelHovered.v * scale, lastVoxelHovered.u * scale, scale, scale);
    gameBoard.strokeRect(lastVoxelHovered.v * scale, lastVoxelHovered.u * scale, scale, scale);
    if (selectedVoxel.u >= 0) {
      gameBoard.fillStyle = "rgb(192, 0, 0)";
      gameBoard.fillRect(selectedVoxel.v * scale, selectedVoxel.u * scale, scale, scale);
    }
    lastVoxelHovered.u = gridPosition.u;
    lastVoxelHovered.v = gridPosition.v;
  }
}

function selectVoxel(gameBoard : CanvasRenderingContext2D, lastVoxelHovered : GridPosition,
                     selectedVoxel : GridPosition, scale : number) : void {
  gameBoard.fillStyle = "rgb(192, 0, 0)";
  gameBoard.fillRect(lastVoxelHovered.v * scale, lastVoxelHovered.u * scale, scale, scale);
  gameBoard.fillStyle = "rgb(256, 256, 256)";
  gameBoard.fillRect(selectedVoxel.v * scale, selectedVoxel.u * scale, scale, scale);
  gameBoard.strokeRect(selectedVoxel.v * scale, selectedVoxel.u * scale, scale, scale);
  selectedVoxel.u = lastVoxelHovered.u;
  selectedVoxel.v = lastVoxelHovered.v;
}

export { captureCursor, drawGrid, onVoxelHover, selectVoxel };

