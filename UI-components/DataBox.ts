import * as API_Types from "../API_Types.js";
import {  inspectProgram, formatConsoleOutput, interpretConsole, nullReturn }
       from "../logic-components/HandleGPLC.js";
import { GridPosition } from "./UI_Types.js";

async function inspectVoxel(mapInterface : API_Types.MapAccessor, selectedVoxel : GridPosition)
                           : Promise<Boolean> {
  const selectedVoxelId = document.getElementById("selectedVoxel");
  const wallStructure = document.getElementById("wallStructure");
  const wallTextures = document.getElementById("wallTextures");
  const objPlace = document.getElementById("objPlace");
  const objGrid = document.getElementById("objGrid");
  const GPLC_ConsoleOutput = document.getElementById("GPLC_ConsoleOutput");
  const floorGrid = document.getElementById("floorGrid");

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
  const floor : API_Types.FloorGrid =
    mapInterface.getFloorGrid(selectedVoxel.w,
      Math.floor(selectedVoxel.u / 2), Math.floor(selectedVoxel.v / 2));
  floorGrid.innerHTML = `Floor grid: {<br><div class="jsonLayer1">
    Height: ${floor.height},<br>
    surface: ${floor.surface}<br></div>
    }`;
  const obj : API_Types.ObjGrid =
    mapInterface.getObjGrid(selectedVoxel.w, selectedVoxel.u, selectedVoxel.v);
  let programWithDiff;
  try {
    programWithDiff = await inspectProgram(obj);
  }
  catch(error) {
    console.log(`inspectVoxel : inspectProgram returned a rejected promise.`);
    programWithDiff = nullReturn;
  }
  let programName = "";
  let programHash = "";
  if (obj.programName !== null) {
    programName = (obj.programName).split(":")[0];
    programHash = (obj.programName).split(":")[1];
  }  
  objGrid.innerHTML = `Object grid: {<br><div class="jsonLayer1">
    Object type: ${obj.objType}<br>
    Program name: ${programName}<br>
    Program hash: ${programHash}<br>
    </div>
    }`;
  if (programWithDiff === nullReturn) {
    GPLC_ConsoleOutput.innerHTML = "";
  }
  else {
    GPLC_ConsoleOutput.innerHTML = formatConsoleOutput(JSON.parse(programWithDiff.program.source));
  }
  return new Promise<boolean>((resolve) => { resolve(true) });
}

export { inspectVoxel };

