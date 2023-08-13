import * as API_Types from "../API_Types.js";

var baseURL = "http://localhost/command";

async function loadMap(uMaxWall : number, vMaxWall : number, uMaxFloor : number, vMaxFloor : number)
                      : Promise <API_Types.MapAccessor> {
  function mapIndices(u : number, v : number, vMax : number, iMax : number) : number {
    return iMax - (vMax + 1) * u - v;
  }

  function boolToInt(x : boolean) : number {
    if (x === true) { return 1 }
    else { return 0 }
  }
  
  async function serverWriteRequest(command : API_Types.Command) : Promise<boolean> {
    const commandStr = JSON.stringify(command);
    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: commandStr
    });
    const result = new Promise<boolean>((resolve, reject) => {
      if (response.status === 200) {
        resolve(true);
      }
      else {
        reject(false);
      }
    });
    return result;
  }

  const wallGrid0 = await loadMapLayer(0, 0, 0, uMaxWall, vMaxWall, "Wall_grid");
  const wallGrid1 = await loadMapLayer(1, 0, 0, uMaxWall, vMaxWall, "Wall_grid");
  const wallGrid2 = await loadMapLayer(2, 0, 0, uMaxWall, vMaxWall, "Wall_grid");
  const floorGrid0 = await loadMapLayer(0, 0, 0, uMaxFloor, vMaxFloor, "Floor_grid");
  const floorGrid1 = await loadMapLayer(1, 0, 0, uMaxFloor, vMaxFloor, "Floor_grid");
  const floorGrid2 = await loadMapLayer(2, 0, 0, uMaxFloor, vMaxFloor, "Floor_grid");
  const objGrid0 = await loadMapLayer(0, 0, 0, uMaxWall, vMaxWall, "Obj_grid");
  const objGrid1 = await loadMapLayer(1, 0, 0, uMaxWall, vMaxWall, "Obj_grid");
  const objGrid2 = await loadMapLayer(2, 0, 0, uMaxWall, vMaxWall, "Obj_grid");
  const iMaxWall = wallGrid0.length - 1;
  const iMaxFloor = floorGrid0.length - 1;

  const getWallGrid = (w : number, u : number, v : number) : API_Types.WallGrid => {
    let grid;
    if (w === 0) { grid = wallGrid0 }
    else if (w === 1) { grid = wallGrid1 }
    else { grid = wallGrid2 }
    return grid[mapIndices(u, v, vMaxWall, iMaxWall)];
  };
  const getFloorGrid = (w : number, u : number, v : number) : API_Types.FloorGrid => {
    let grid;
    if (w === 0) { grid = floorGrid0 }
    else if (w === 1) { grid = floorGrid1 }
    else { grid = floorGrid2 }
    return grid[mapIndices(u, v, vMaxFloor, iMaxFloor)];
  };
  const getObjGrid = (w : number, u : number, v : number) : API_Types.ObjGrid => {
    let grid;
    if (w === 0) { grid = objGrid0 }
    else if (w === 1) { grid = objGrid1 }
    else { grid = objGrid2 }
    return grid[mapIndices(u, v, vMaxWall, iMaxWall)];
  };
  const updateWallGrid = async (w : number, u : number, v : number) : Promise<boolean> => {
    const newVoxel = await loadMapLayer(w, u, v, u, v, "Wall_grid");
    let grid;
    if (w === 0) { grid = wallGrid0 }
    else if (w === 1) { grid = wallGrid1 }
    else { grid = wallGrid2 }
    grid[mapIndices(u, v, vMaxWall, iMaxWall)] = newVoxel[0];
    return new Promise<boolean>((resolve) => {resolve(true)});
  };
  const updateFloorGrid = async (w : number, u : number, v : number) : Promise<boolean> => {
    const newVoxel = await loadMapLayer(w, u, v, u, v, "Floor_grid");
    let grid;
    if (w === 0) { grid = floorGrid0 }
    else if (w === 1) { grid = floorGrid1 }
    else { grid = floorGrid2 }
    grid[mapIndices(u, v, vMaxFloor, iMaxFloor)] = newVoxel[0];
    return new Promise<boolean>((resolve) => {resolve(true)});
  };
  const updateObjGrid = async (w : number, u : number, v : number) : Promise<boolean> => {
    const newVoxel = await loadMapLayer(w, u, v, u, v, "Obj_grid");
    let grid;
    if (w === 0) { grid = objGrid0 }
    else if (w === 1) { grid = objGrid1 }
    else { grid = objGrid2 }
    grid[mapIndices(u, v, vMaxWall, iMaxWall)] = newVoxel[0];
    return new Promise<boolean>((resolve) => {resolve(true)});
  };
  const setWallGridStructure = async (w : number, u : number, v : number,
                                      u1_structure : boolean, u2_structure : boolean,
                                      v1_structure : boolean, v2_structure : boolean)
                                     : Promise<boolean> => {
    const command = {
      keyword: "write",
      arguments: ["Wall_grid", "structure", `${w}`, `${u}`, `${v}`,
                  `${boolToInt(u1_structure)}`, `${boolToInt(u2_structure)}`,
                  `${boolToInt(v1_structure)}`, `${boolToInt(v2_structure)}`]
    };
    return serverWriteRequest(command);
  };
  const setWallGridTextures = async (w : number, u : number, v : number,
                                     u1_texture : number, u2_texture : number,
                                     v1_texture : number, v2_texture : number)
                                    : Promise<boolean>=> {
    const command = {
      keyword: "write",
      arguments: ["Wall_grid", "textures", `${w}`, `${u}`, `${v}`,
                  `${u1_texture}`, `${u2_texture}`, `${v1_texture}`, `${v2_texture}`]
    };
    return serverWriteRequest(command);
  };
  const setObjPlace = (w : number, u : number, v : number,
                       modelIdent : number, u__ : number, v__ : number, w__ : number,
                       texture : number, numElem : number, objFlag : number) : Promise<boolean> => {
    const command = {
      keyword: "write",
      arguments: ["Wall_grid", "Obj_place", `${w}`, `${u}`, `${v}`, `${modelIdent}`,
                  `${u__}`, `${v__}`, `${w__}`, `${texture}`, `${numElem}`, `${objFlag}`]
    };
    return serverWriteRequest(command);
  };
  const setFloorGrid = async (w : number, u : number, v : number, height : number, terrain : string)
                             : Promise<boolean> => {
    const command = {
      keyword: "write",
      arguments: ["Floor_grid", `${w}`, `${u}`, `${v}`, `${height}`, `${terrain}`]
    };
    return serverWriteRequest(command);
  };
  const setObjGrid = async (w : number, u : number, v : number,
                            objType : number, program : number[]) : Promise<boolean> => {
    const args = ["Obj_grid", `${w}`, `${u}`, `${v}`, `${objType}`];
    program.forEach((value) => { args.push(`${value}`) });
    const command = {
      keyword: "write",
      arguments: args
    };
    return serverWriteRequest(command);
  };

  const result = new Promise<API_Types.MapAccessor>((resolve) => {
    resolve({
      getWallGrid: getWallGrid,
      getFloorGrid: getFloorGrid,
      getObjGrid: getObjGrid,
      setWallGridStructure: setWallGridStructure,
      setWallGridTextures: setWallGridTextures,
      setObjPlace: setObjPlace,
      setFloorGrid: setFloorGrid,
      setObjGrid: setObjGrid,
      updateWallGrid: updateWallGrid,
      updateFloorGrid: updateFloorGrid,
      updateObjGrid: updateObjGrid,
      uMaxWall: uMaxWall,
      vMaxWall: vMaxWall,
      uMaxFloor: uMaxFloor,
      vMaxFloor: vMaxFloor
    });
  });
  
  return result;
}

// This function can be used to load specified areas of each of the map layers (Wall_grid, 
// Floor_grid and Obj_grid) from the server.
async function loadMapLayer(w : number, uMin : number, vMin : number, uMax : number, vMax : number,
                            mapLayer : string)
                           : Promise<API_Types.WallGrid[] | API_Types.FloorGrid[]
                           | API_Types.ObjGrid[]> {
  const command = {
    keyword: "read",
    arguments: [`${w}`, `${uMin}`, `${vMin}`, `${uMax}`, `${vMax}`, mapLayer]
  };
  const commandStr = JSON.stringify(command);
  const response = await fetch(baseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: commandStr
  });
  const serverResult = await response.json();
  const result = new Promise<API_Types.WallGrid[] | API_Types.FloorGrid[] | API_Types.ObjGrid[]>
    ((resolve, reject) => {
      if (response.status === 200) {
        resolve(serverResult);
      }
      else {
        reject(null);
      }
  });
  return result;
}

// This function can be used to load a specified GPLC_Program object from the server.
async function getProgram(fileIndex : Number) : Promise<API_Types.GPLC_Program> {
  const command = {
    keyword: "GPLC",
    arguments: ["query", `${fileIndex}`]
  };
  const commandStr = JSON.stringify(command);
  const response = await fetch(baseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: commandStr
  });
  const program = await response.json();
  const result = new Promise<API_Types.GPLC_Program>((resolve, reject) => {
    if (response.status === 200) {
      resolve({
        name: program.name,
        hash: program.hash,
        source: program.source,
        bytecode: program.bytecode
      });
    }
    else {
      reject(null)
    }
  });
  return result;
}

export { loadMap, getProgram };

