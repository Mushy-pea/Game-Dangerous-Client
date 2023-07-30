import * as API_Types from "../API_Types.js";

// This function can be used to load specified areas of each of the map layers (Wall_grid, 
// Floor_grid and Obj_grid) from the server.
async function loadMapLayer(w : number, uMin : number, vMin : number, uMax : number, vMax : number,
                            mapLayer : string)
                           : Promise<API_Types.WallGrid[] | API_Types.FloorGrid[] | API_Types.ObjGrid[]> {
  const baseURL = "http://localhost/command";
  const command : API_Types.Command = {
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
  const baseURL = "http://localhost/command";
  const command : API_Types.Command = {
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

export { loadMapLayer, getProgram};

