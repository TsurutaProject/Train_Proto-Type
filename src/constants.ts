import type {
  Direction,
  TrackType,
} from "./types";

export const ROWS = 5;
export const COLS = 10;

export const TARGET_TIME = 15;

export const START = {
  row: 2,
  col: 0,
};

export const GOAL = {
  row: 2,
  col: 9,
};

export const CHECK_A = {
  row: 1,
  col: 3,
};

export const CHECK_B = {
  row: 3,
  col: 6,
};

export const SIGNAL = {
  row: 1,
  col: 7,
};

export const TUNNEL_1 = {
  row: 0,
  col: 8,
};

export const TUNNEL_2 = {
  row: 4,
  col: 2,
};

export const connections: Record<
  TrackType,
  Direction[]
> = {
  empty: [],

  horizontal: ["left", "right"],

  vertical: ["up", "down"],

  curveRD: ["right", "down"],

  curveLD: ["left", "down"],

  curveRU: ["right", "up"],

  curveLU: ["left", "up"],

  fastHorizontal: [
    "left",
    "right",
  ],

  fastVertical: [
    "up",
    "down",
  ],

  station: [
    "up",
    "down",
    "left",
    "right",
  ],

  checkpointA: [
    "up",
    "down",
    "left",
    "right",
  ],

  checkpointB: [
    "up",
    "down",
    "left",
    "right",
  ],

  signal: [
    "up",
    "down",
    "left",
    "right",
  ],

  tunnel: [
    "up",
    "down",
    "left",
    "right",
  ],
};

export const trackTime: Record<
  TrackType,
  number
> = {
  empty: 0,

  horizontal: 1,
  vertical: 1,

  curveRD: 1,
  curveLD: 1,
  curveRU: 1,
  curveLU: 1,

  fastHorizontal: 2,
  fastVertical: 2,

  station: 0,
  checkpointA: 0,
  checkpointB: 0,

  signal: 0,

  tunnel: 0,
};

export const directionMove = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
} as const;

export const oppositeDirection = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
} as const;

export const selectableTracks: TrackType[] =
  [
    "horizontal",
    "vertical",

    "curveRD",
    "curveLD",
    "curveRU",
    "curveLU",

    "fastHorizontal",
    "fastVertical",

    "empty",
  ];
  