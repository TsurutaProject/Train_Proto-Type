import {
  useState,
  useEffect,
} from "react";
import Toolbar from "./components/Toolbar";
import StatusPanel from "./components/StatusPanel";
import GameBoard from "./components/GameBoard";
import Track from "./components/Track";

import "./App.css";

import type { TrackType } from "./types";

import { findPath } from "./logic/findPath";

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

  TARGET_TIME,

  selectableTracks,
} from "./constants";

export default function App() {
  const [selectedTrack, setSelectedTrack] =
    useState<TrackType>("horizontal");

  const [trainIndex, setTrainIndex] =
    useState(-1);

  const [isRunning, setIsRunning] =
    useState(false);
  const [grid, setGrid] = useState<
    TrackType[][]
  >(
    Array.from({ length: ROWS }, () =>
      Array.from(
        { length: COLS },
        () => "empty"
      )
    )
  );

  const handleClick = (
    row: number,
    col: number
  ) => {
    const isSpecial =
      (row === START.row &&
        col === START.col) ||

      (row === GOAL.row &&
        col === GOAL.col) ||

      (row === CHECK_A.row &&
        col === CHECK_A.col) ||

      (row === CHECK_B.row &&
        col === CHECK_B.col) ||

      (row === SIGNAL.row &&
        col === SIGNAL.col) ||

      (row === TUNNEL_1.row &&
        col === TUNNEL_1.col) ||

      (row === TUNNEL_2.row &&
        col === TUNNEL_2.col);

    if (isSpecial) return;

    const copy = grid.map((r) => [...r]);

    copy[row][col] = selectedTrack;

    setGrid(copy);
  };

  const result = findPath(grid);

  const path = result.path;

  const isConnected =
    result.connected;

  const totalTime =
    result.totalTime;

  const visitedA =
    result.visitedA;

  const visitedB =
    result.visitedB;

  const connectedCells =
    result.connectedCells;

  const connectedA =
    connectedCells[
      CHECK_A.row
    ][CHECK_A.col];

  const connectedB =
    connectedCells[
      CHECK_B.row
    ][CHECK_B.col];

  const connectedSignal =
    connectedCells[
      SIGNAL.row
    ][SIGNAL.col];

  const connectedTunnel1 =
    connectedCells[
      TUNNEL_1.row
    ][TUNNEL_1.col];

  const connectedTunnel2 =
    connectedCells[
      TUNNEL_2.row
    ][TUNNEL_2.col];

  const isClear =
    isConnected &&
    visitedA &&
    visitedB &&
    totalTime === TARGET_TIME;

  const startTrain = () => {
    if (!isConnected) return;

    setTrainIndex(0);
    setIsRunning(true);
  };
  
  useEffect(() => {
    if (!isRunning) return;

    if (
      trainIndex >=
      path.length - 1
    ) {
      setIsRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      setTrainIndex(
        (prev) => prev + 1
      );
    }, 500);

    return () =>
      clearTimeout(timer);
  }, [
    trainIndex,
    isRunning,
    path,
  ]);


  return (
    <div className="container">
      <h1>電車レールゲーム</h1>
      <StatusPanel
        targetTime={TARGET_TIME}
        totalTime={totalTime}
        isConnected={isConnected}
        visitedA={visitedA}
        visitedB={visitedB}
      />

      <Toolbar
        selectedTrack={selectedTrack}
        setSelectedTrack={
          setSelectedTrack
        }
        selectableTracks={
          selectableTracks
        }
      />

      <button
        onClick={startTrain}
      >
        🚄 発車
      </button>

      <GameBoard>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isStart =
              rowIndex === START.row &&
              colIndex === START.col;

            const isGoal =
              rowIndex === GOAL.row &&
              colIndex === GOAL.col;

            const isTrainHere =
              trainIndex >= 0 &&
              trainIndex < path.length &&
              path[trainIndex].row === rowIndex &&
              path[trainIndex].col === colIndex;
              
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  cell
                  ${
                    cell !== "empty"
                      ? "track"
                      : ""
                  }
                  ${
                    isStart ? "start" : ""
                  }
                  ${
                    isGoal ? "goal" : ""
                  }

                  ${
                    rowIndex ===
                      CHECK_A.row &&
                    colIndex ===
                      CHECK_A.col &&
                    connectedA
                      ? "connected-special"
                      : ""
                  }

                  ${
                    rowIndex ===
                      CHECK_B.row &&
                    colIndex ===
                      CHECK_B.col &&
                    connectedB
                      ? "connected-special"
                      : ""
                  }

                  ${
                    rowIndex ===
                      SIGNAL.row &&
                    colIndex ===
                      SIGNAL.col &&
                    connectedSignal
                      ? "connected-signal"
                      : ""
                  }

                  ${
                    rowIndex ===
                      TUNNEL_1.row &&
                    colIndex ===
                      TUNNEL_1.col &&
                    connectedTunnel1
                      ? "connected-tunnel"
                      : ""
                  }

                  ${
                    rowIndex ===
                      TUNNEL_2.row &&
                    colIndex ===
                      TUNNEL_2.col &&
                    connectedTunnel2
                      ? "connected-tunnel"
                      : ""
                  }
                `}
                onClick={() =>
                  handleClick(
                    rowIndex,
                    colIndex
                  )
                }
              >
                {isTrainHere 
                  ? "🚄"
                  :isStart
                  ? "S"
                  : isGoal
                  ? "G"
                  : rowIndex ===
                        CHECK_A.row &&
                      colIndex ===
                        CHECK_A.col
                  ? "A"
                  : rowIndex ===
                        CHECK_B.row &&
                      colIndex ===
                        CHECK_B.col
                  ? "B"
                  : rowIndex ===
                        SIGNAL.row &&
                      colIndex ===
                        SIGNAL.col
                  ? "🚦"
                  : rowIndex ===
                        TUNNEL_1.row &&
                      colIndex ===
                        TUNNEL_1.col
                  ? "🌀"
                  : rowIndex ===
                        TUNNEL_2.row &&
                      colIndex ===
                        TUNNEL_2.col
                  ? "🌀"
                  : <Track type={cell} />}
              </div>
            );
          })
        )}
      </GameBoard>

      {isClear ? (
        <h2 className="clear">
          クリア！
        </h2>
      ) : (
        <h2>
          A・B駅を通って
          時間を調整しよう！
        </h2>
      )}
    </div>
  );
}
