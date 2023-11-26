import * as API_Types from "../API_Types.js";
import * as ServerInterface from "../logic-components/ServerInterface.js";
import { checkProgramDiff, SymbolValue } from "../logic-components/HandleGPLC.js";
import { GridPosition } from "./UI_Types.js";

async function inspectProgram(objGrid : API_Types.ObjGrid) : Promise<SymbolValue[]> {
  let deployedName;
  const nullProgram = [{
    symbol: "null",
    value: 0,
    diff: 0
  }];
  if (objGrid.programName !== null) {
    deployedName = ((objGrid.programName).split(":"))[0];
  }
  else {
    return new Promise<SymbolValue[]>((resolve) => { resolve(nullProgram) });
  }  
  let programSet;
  try {
    programSet = await ServerInterface.serverReadRequest({
      keyword: "GPLC",
      arguments: ["list", "null"]
    });
  }
  catch(error) {
    window.alert(`inspectProgram : failed(1) : ${error}`);
    return new Promise<SymbolValue[]>((resolve, reject) => {
      reject(null);
    });
  }
  const i = programSet.findIndex((element) => {
    if (element === deployedName) { return true }
    else { return false }
  });
  let sourceProgram;
  try {
    if (i >= 0) {
      sourceProgram = await ServerInterface.getProgram(i);
    }
    else { throw new Error("No matching program found") }
  }
  catch(error) {
    return new Promise<SymbolValue[]>((resolve) => {
      resolve(nullProgram);
    });
  }
  const diff = checkProgramDiff(sourceProgram, objGrid);
  return new Promise<SymbolValue[]>((resolve) => {
    if (diff !== null) { resolve(diff) }
    else { resolve(nullProgram) }
  });
}

async function inspectVoxel(mapInterface : API_Types.MapAccessor, selectedVoxel : GridPosition)
                           : Promise<Boolean> {
  const selectedVoxelId = document.getElementById("selectedVoxel");
  const wallStructure = document.getElementById("wallStructure");
  const wallTextures = document.getElementById("wallTextures");
  const objPlace = document.getElementById("objPlace");
  const objGridId = document.getElementById("objGrid");
  const floorGridId = document.getElementById("floorGrid");

  selectedVoxelId.innerText = `Selected voxel (u, v): (${selectedVoxel.u}, ${selectedVoxel.v})`;

  const wallGrid : API_Types.WallGrid =
    mapInterface.getWallGrid(selectedVoxel.w, selectedVoxel.u, selectedVoxel.v);
  wallStructure.innerHTML = `Wall structure: {<br><div class="jsonLayer1">
    u1: ${wallGrid.u1_structure},<br>
    u2: ${wallGrid.u2_structure},<br>
    v1: ${wallGrid.v1_structure},<br>
    v2: ${wallGrid.v2_structure}<br></div>
    }`;
  wallTextures.innerHTML = `Wall textures: {<br><div class="jsonLayer1">
    u1: ${wallGrid.u1_texture},<br>
    u2: ${wallGrid.u2_texture},<br>
    v1: ${wallGrid.v1_texture},<br>
    v2: ${wallGrid.v2_texture}<br></div>
    }`;
  objPlace.innerHTML = `Model placed in voxel: {<br><div class="jsonLayer1">
    Model ident: ${wallGrid.objPlace.modelIdent},<br>
    u: ${wallGrid.objPlace.u},<br>
    v: ${wallGrid.objPlace.v},<br>
    w: ${wallGrid.objPlace.w},<br>
    Texture: ${wallGrid.objPlace.texture},<br>
    Number of model elements: ${wallGrid.objPlace.numElem},<br>
    Object flag: ${wallGrid.objPlace.objFlag}<br></div>
    }`;
  const objGrid : API_Types.ObjGrid =
    mapInterface.getObjGrid(selectedVoxel.w, selectedVoxel.u, selectedVoxel.v);
  let programDiff;
  try {
    programDiff = await inspectProgram(objGrid);
  }
  catch(error) {
    window.alert(`inspectProgram : failed : ${error}`);
  }
  objGridId.innerHTML = `Object grid: {<br><div class="jsonLayer1">
    Object type: ${objGrid.objType}<br>
    Program name: ${objGrid.programName}<br>
    Program diff: ${JSON.stringify(programDiff)}<br></div>
    }`;
  const floorGrid : API_Types.FloorGrid =
    mapInterface.getFloorGrid(selectedVoxel.w,
      Math.floor(selectedVoxel.u / 2), Math.floor(selectedVoxel.v / 2));
  floorGridId.innerHTML = `Floor grid: {<br><div class="jsonLayer1">
    Height: ${floorGrid.height},<br>
    surface: ${floorGrid.surface}<br></div>
    }`;
  return new Promise<boolean>((resolve) => { resolve(true) });
}

export { inspectVoxel };

