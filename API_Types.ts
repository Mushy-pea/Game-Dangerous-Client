type Command = {
  keyword : string,
  arguments : string[]
};

type ObjPlace = {
  modelIdent : number,
  u : number,
  v : number,
  w : number,
  texture : number,
  numElem : number,
  objFlag : number
};

type WallGrid = {
  u1_structure : boolean,
  u2_structure : boolean,
  v1_structure : boolean,
  v2_structure : boolean,
  u1_texture : number,
  u2_texture : number,
  v1_texture : number,
  v2_texture : number,
  objPlace : ObjPlace
};

type FloorGrid = {
  height : number,
  surface : string
};

type ObjGrid = {
  objType : number,
  program : number[],
  programName : string
};

type Token = {
  line : number,
  column : number,
  content : string,
  textColour : string
};

type GPLC_Program = {
  name : string,
  hash : string,
  source : string,
  bytecode : string
};

type MapAccessor = {
  getWallGrid : Function,
  getFloorGrid : Function,
  getObjGrid : Function,
  setWallGridStructure : Function,
  setWallGridTextures: Function,
  setObjPlace : Function,
  setFloorGrid : Function,
  setObjGrid : Function,
  uMaxWall : number,
  vMaxWall : number,
  uMaxFloor : number,
  vMaxFloor : number
};

export { Command, ObjPlace, WallGrid, FloorGrid, ObjGrid, GPLC_Program, Token, MapAccessor};

