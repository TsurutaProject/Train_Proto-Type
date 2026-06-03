export type TrackType =
  | "empty"

  | "horizontal"
  | "vertical"

  | "curveRD"
  | "curveLD"
  | "curveRU"
  | "curveLU"

  | "fastHorizontal"
  | "fastVertical"

  | "station"

  | "checkpointA"
  | "checkpointB"

  | "signal"

  | "tunnel";

export type Direction =
  | "up"
  | "down"
  | "left"
  | "right";

export type Position = {
  row: number;
  col: number;
};
