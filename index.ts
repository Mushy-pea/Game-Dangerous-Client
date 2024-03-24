import * as ServerInterface from "./logic-components/ServerInterface.js";
import * as GameBoard from "./UI-components/GameBoard.js";
import { interpretConsole } from "./logic-components/HandleGPLC.js";

async function checkConsole() : Promise<boolean> {
  const GPLC_ConsoleInput = <HTMLTextAreaElement>document.getElementById("GPLC_ConsoleInput");
  const GPLC_ConsoleOutput = document.getElementById("GPLC_ConsoleOutput");
  GPLC_ConsoleOutput.innerHTML = await interpretConsole(GPLC_ConsoleInput.value.trimEnd());
  GPLC_ConsoleInput.value = "";
  return new Promise<boolean>((resolve) => { resolve(true) });
}

async function main() {
  function handleKeyDown(event : KeyboardEvent) : void {
    if (event.code === "Enter") { checkConsole() }
    else {
      GameBoard.updateGridOffset(event, gridOffset, gameBoard,
        mapInterface, scale, mapInterface.uMaxWall, mapInterface.vMaxWall);
    }
  }

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
  
  const dataBox = <HTMLDivElement>document.getElementById("dataBox");
  dataBox.style.height = `${canvas.height}px`;
  
  const gameBoard = canvas.getContext("2d");
  const cursorPosition = {x: 0, y: 0};
  const lastVoxelHovered = {w: 0, u: 0, v: 0, outOfBounds: false};
  const selectedVoxel = {w: 0, u: 0, v: 0, outOfBounds: false};
  const gridOffset = {
    uMin: 0, uMax: Math.trunc(boardHeight / scale) - 1,
    vMin: 0, vMax: Math.trunc(boardWidth / scale) - 1
  };
  const wallHovered = {wall: "notWall"};

  document.onmousemove = event => GameBoard.captureCursor(canvas, event, cursorPosition);
  document.onmousedown = event => {
    try {
      GameBoard.selectVoxel(gameBoard, mapInterface, gridOffset,
        lastVoxelHovered, selectedVoxel, wallHovered, scale);
    }
    catch(error) {
      console.log(`selectVoxel : failed : ${error}`);
    }    
  };
  document.onkeydown = event => handleKeyDown(event);
  GameBoard.drawGrid(gameBoard, mapInterface, gridOffset, 0, 0, scale, "iterative");
  setInterval(GameBoard.onVoxelHover, 40, gameBoard, mapInterface, gridOffset, lastVoxelHovered,
              selectedVoxel, wallHovered, cursorPosition, scale);
}

main();

