import type {
  TrackType,
  Position,
} from "../types";

import {
  ROWS,
  COLS,
  START,
  GOAL,
  CHECK_A,
  CHECK_B,
  SIGNAL,
  TUNNEL_1,
  TUNNEL_2,
  connections,
  trackTime,
  directionMove,
  oppositeDirection,
} from "../constants";

type Result = {
  connected: boolean;

  totalTime: number;

  visitedA: boolean;
  visitedB: boolean;

  connectedCells: boolean[][];

  path: Position[];
};

export function findPath(
  grid: TrackType[][]
): Result {
  const visited = Array.from(
    { length: ROWS },
    () =>
      Array.from(
        { length: COLS },
        () => false
      )
  );

  const connectedCells =
    Array.from(
      { length: ROWS },
      () =>
        Array.from(
          { length: COLS },
          () => false
        )
    );

  let totalTime = 0;

  let visitedA = false;
  let visitedB = false;

  const path: Position[] = [];

  function getTrackType(
    row: number,
    col: number
  ): TrackType {
    if (
      row === START.row &&
      col === START.col
    ) {
      return "station";
    }

    if (
      row === GOAL.row &&
      col === GOAL.col
    ) {
      return "station";
    }

    if (
      row === CHECK_A.row &&
      col === CHECK_A.col
    ) {
      return "checkpointA";
    }

    if (
      row === CHECK_B.row &&
      col === CHECK_B.col
    ) {
      return "checkpointB";
    }

    if (
      row === SIGNAL.row &&
      col === SIGNAL.col
    ) {
      return "signal";
    }

    if (
      row === TUNNEL_1.row &&
      col === TUNNEL_1.col
    ) {
      return "tunnel";
    }

    if (
      row === TUNNEL_2.row &&
      col === TUNNEL_2.col
    ) {
      return "tunnel";
    }

    return grid[row][col];
  }

  function dfs(
    row: number,
    col: number
  ): boolean {
    visited[row][col] = true;

    connectedCells[row][col] =
      true;

    path.push({
      row,
      col,
    });

    const currentType =
      getTrackType(row, col);

    totalTime +=
      trackTime[currentType];

    if (
      currentType ===
      "checkpointA"
    ) {
      visitedA = true;
    }

    if (
      currentType ===
      "checkpointB"
    ) {
      visitedB = true;
    }

    if (
      currentType === "signal"
    ) {
      totalTime += 3;
    }

    if (
      currentType === "tunnel"
    ) {
      const target =
        row === TUNNEL_1.row &&
        col === TUNNEL_1.col
          ? TUNNEL_2
          : TUNNEL_1;

      if (
        !visited[target.row][
          target.col
        ]
      ) {
        path.push({
          row: target.row,
          col: target.col,
        });

        return dfs(
          target.row,
          target.col
        );
      }
    }

    if (
      row === GOAL.row &&
      col === GOAL.col
    ) {
      return true;
    }

    for (const dir of connections[
      currentType
    ]) {
      const [dr, dc] =
        directionMove[dir];

      const nr = row + dr;
      const nc = col + dc;

      if (
        nr < 0 ||
        nr >= ROWS ||
        nc < 0 ||
        nc >= COLS
      ) {
        continue;
      }

      if (visited[nr][nc]) {
        continue;
      }

      const nextType =
        getTrackType(nr, nc);

      if (nextType === "empty") {
        continue;
      }

      const opposite =
        oppositeDirection[dir];

      if (
        !connections[
          nextType
        ].includes(opposite)
      ) {
        continue;
      }

      if (dfs(nr, nc)) {
        return true;
      }
    }

    path.pop();

    return false;
  }

  const connected = dfs(
    START.row,
    START.col
  );

  return {
    connected,

    totalTime,

    visitedA,
    visitedB,

    connectedCells,

    path,
  };
}
