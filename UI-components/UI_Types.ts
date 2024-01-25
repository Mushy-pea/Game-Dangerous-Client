type CursorPosition = {
  x : number,
  y : number
};

type GridPosition = {
  w : number,
  u : number,
  v : number,
  outOfBounds : boolean
};

type GridOffset = {
  uMin : number,
  uMax : number,
  vMin : number,
  vMax : number
};

type VoxelPoints = {
  boundary : number[],
  u1 : number[],
  u2 : number[],
  v1 : number[],
  v2 : number[]
};

export { CursorPosition, GridPosition, GridOffset, VoxelPoints };

