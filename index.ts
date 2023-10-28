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
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let boardWidth;
  let boardHeight;
  if (windowWidth <= 1280 || windowHeight <= 720) {
    boardWidth = 720;
    boardHeight = 540;
  }
  else if (windowWidth <= 1920 || windowHeight <= 1080) {
    boardWidth = 1152;
    boardHeight = 864;
  }
  else if (windowWidth <= 2560 || windowHeight <= 1440) {
    boardWidth = 1600;
    boardHeight = 1200;
  }
  else if (windowWidth <= 3200 || windowHeight <= 1800) {
    boardWidth = 2000;
    boardHeight = 1600;
  }
  else {
    boardWidth = 2560;
    boardHeight = 1920;
  }

  const canvas = <HTMLCanvasElement>document.getElementById("gameBoard");
  const scale = 75;
  canvas.width = Math.trunc(boardWidth / scale) * scale;
  canvas.height = Math.trunc(boardHeight / scale) * scale;
  console.log(`Window dimensions detected: ${windowWidth} * ${windowHeight}`);
  console.log(`Game board component sized to: ${boardWidth} * ${boardHeight}`);
  const gameBoard = canvas.getContext("2d");
  const cursorPosition = {x: 0, y: 0};
  const lastVoxelHovered = {w: 0, u: 0, v: 0};
  const selectedVoxel = {w: 0, u: 0, v: 0};
  const gridOffset = {
    uMin: 0, uMax: Math.trunc(boardHeight / scale) - 1,
    vMin: 0, vMax: Math.trunc(boardWidth / scale) - 1
  };
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

