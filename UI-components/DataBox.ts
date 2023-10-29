import * as API_Types from "../API_Types.js";
import { GridPosition } from "./UI_Types.js";

function inspectVoxel(mapInterface : API_Types.MapAccessor, selectedVoxel : GridPosition) : void {
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
  objGridId.innerHTML = `Object grid: {<br><div class="jsonLayer1">
    Object type: ${objGrid.objType}<br>
    Program name: ${objGrid.programName}<br></div>
    }`;
  const floorGrid : API_Types.FloorGrid =
    mapInterface.getFloorGrid(selectedVoxel.w,
      Math.floor(selectedVoxel.u / 2), Math.floor(selectedVoxel.v / 2));
  floorGridId.innerHTML = `Floor grid: {<br><div class="jsonLayer1">
    Height: ${floorGrid.height},<br>
    surface: ${floorGrid.surface}<br></div>
    }`;
}

export { inspectVoxel };

