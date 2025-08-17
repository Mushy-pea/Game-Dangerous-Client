import * as API_Types from "../API_Types.js";
import {  inspectProgram, formatConsoleOutput, consoleState, nullConsoleState }
       from "../logic-components/HandleGPLC.js";
import { GridPosition } from "./UI_Types.js";

const defObjPlace = {
  modelIdent : -1,
  u : 0,
  v : 0,
  w : 0,
  texture : 0,
  numElem : 0,
  objFlag : 0
};

async function inspectVoxel(mapInterface : API_Types.MapAccessor, selectedVoxel : GridPosition,
                            wallGridMirrorSwitch : boolean)
                           : Promise<Boolean> {

  consoleState.w = selectedVoxel.w;
  consoleState.u = selectedVoxel.u;
  consoleState.v = selectedVoxel.v;
  const selectedVoxelId = document.getElementById("selectedVoxel");
  const wallStructure = document.getElementById("wallStructure");
  const wallTextures = document.getElementById("wallTextures");
  const objPlace = document.getElementById("objPlace");
  const objGrid = document.getElementById("objGrid");
  const GPLC_ConsoleOutput = document.getElementById("GPLC_ConsoleOutput");
  const floorGrid = document.getElementById("floorGrid");

  selectedVoxelId.innerText = `Selected voxel (w, u, v): (${selectedVoxel.w}, ${selectedVoxel.u}, ${selectedVoxel.v})`;

  let wallGrid : API_Types.WallGrid =
    mapInterface.getWallGrid(selectedVoxel.w, selectedVoxel.u, selectedVoxel.v);
  if (wallGrid.objPlace === null) {
    wallGrid.objPlace = defObjPlace;
  }
  let wallGridMirror : API_Types.WallGrid =
    mapInterface.getWallGrid(- (selectedVoxel.w + 1), selectedVoxel.u, selectedVoxel.v);
  if (wallGridMirror.objPlace === null) {
    wallGridMirror.objPlace = defObjPlace;
  }
  wallStructure.innerHTML = `Wall structure: {<br><div class="indentLevel1">
    u1: ${wallGrid.u1_structure},<br>
    u2: ${wallGrid.u2_structure},<br>
    v1: ${wallGrid.v1_structure},<br>
    v2: ${wallGrid.v2_structure}<br></div>
    }`;
  wallTextures.innerHTML = `Wall textures: {<br><div class="indentLevel1">
    u1: ${wallGrid.u1_texture},<br>
    u2: ${wallGrid.u2_texture},<br>
    v1: ${wallGrid.v1_texture},<br>
    v2: ${wallGrid.v2_texture}<br></div>
    }`;
  let wallGridRef = wallGrid;
  let wallGridDescriptor = "Non - mirrored";
  if (wallGridMirrorSwitch) {
    wallGridRef = wallGridMirror;
    wallGridDescriptor = "Mirrored";
  }
  objPlace.innerHTML = `Model placed in voxel (${wallGridDescriptor}): {<br><div class="indentLevel1">
    Model ident: ${wallGridRef.objPlace.modelIdent},<br>
    u: ${wallGridRef.objPlace.u},<br>
    v: ${wallGridRef.objPlace.v},<br>
    w: ${wallGridRef.objPlace.w},<br>
    Texture: ${wallGridRef.objPlace.texture},<br>
    Number of model elements: ${wallGridRef.objPlace.numElem},<br>
    Object flag: ${wallGridRef.objPlace.objFlag}<br></div>
    }`;
  const floor : API_Types.FloorGrid =
    mapInterface.getFloorGrid(selectedVoxel.w,
      Math.floor(selectedVoxel.u / 2), Math.floor(selectedVoxel.v / 2));
  floorGrid.innerHTML = `Floor grid: {<br><div class="indentLevel1">
    Height: ${floor.height},<br>
    surface: ${floor.surface}<br></div>
    }`;
  const obj : API_Types.ObjGrid =
    mapInterface.getObjGrid(selectedVoxel.w, selectedVoxel.u, selectedVoxel.v);
  let nextConsoleState;
  try {
    nextConsoleState = await inspectProgram(obj);
  }
  catch(error) {
    console.log(`inspectVoxel : inspectProgram returned a rejected promise.`);
    nextConsoleState = nullConsoleState;
  }
  let programName = "";
  let programHash = "";
  if (obj.programName !== null) {
    programName = (obj.programName).split(":")[0];
    programHash = (obj.programName).split(":")[1];
  }  
  objGrid.innerHTML = `Object grid: {<br><div class="indentLevel1">
    Object type: ${obj.objType}<br>
    Program name: ${programName}<br>
    Program hash: ${programHash}<br>
    </div>
    }`;
  if (nextConsoleState === nullConsoleState) {
    consoleState.programIndex = -1;
    consoleState.program = null;
    consoleState.programDiff = [];
    GPLC_ConsoleOutput.innerHTML = "";
  }
  else {
    consoleState.programIndex = nextConsoleState.programIndex;
    consoleState.program = nextConsoleState.program;
    consoleState.programDiff = nextConsoleState.programDiff;
    GPLC_ConsoleOutput.innerHTML =
      formatConsoleOutput(JSON.parse(consoleState.program.source), consoleState.programDiff, true);
  }
  return new Promise<boolean>((resolve) => { resolve(true) });
}

export { inspectVoxel };

