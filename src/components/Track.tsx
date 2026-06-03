import type { TrackType } from "../types";

type Props = {
  type: TrackType;
};

export default function Track({
  type,
}: Props) {
  if (type === "horizontal") {
    return (
      <svg width="50" height="50">
        <line
          x1="5"
          y1="20"
          x2="45"
          y2="20"
          stroke="black"
          strokeWidth="4"
        />
        <line
          x1="5"
          y1="30"
          x2="45"
          y2="30"
          stroke="black"
          strokeWidth="4"
        />
      </svg>
    );
  }

  if (type === "vertical") {
    return (
      <svg width="50" height="50">
        <line
          x1="20"
          y1="5"
          x2="20"
          y2="45"
          stroke="black"
          strokeWidth="4"
        />
        <line
          x1="30"
          y1="5"
          x2="30"
          y2="45"
          stroke="black"
          strokeWidth="4"
        />
      </svg>
    );
  }

    if (type === "curveRD") {
        return (
            <svg width="50" height="50">
            <path
            d="M25 5
            A20 20 0 0 0 5 25
            L5 45"
            stroke="black"
            strokeWidth="4"
            fill="none"
        />
        <path
            d="M25 15
            A10 10 0 0 0 15 25
            L15 45"
            stroke="black"
            strokeWidth="4"
            fill="none"
        />
            </svg>
        );
    }

    if (type === "curveLD") {
        return (
            <svg width="50" height="50">
            <path
                d="M25 5
                A20 20 0 0 1 45 25
                L45 45"
                stroke="black"
                strokeWidth="4"
                fill="none"
            />
            <path
                d="M25 15
                A10 10 0 0 1 35 25
                L35 45"
                stroke="black"
                strokeWidth="4"
                fill="none"
            />
            </svg>
        );
    }

    if (type === "curveLU") {
        return (
            <svg width="50" height="50">
            <path
                d="M25 45
                A20 20 0 0 0 45 25"
                stroke="black"
                strokeWidth="4"
                fill="none"
            />
            <path
                d="M45 25
                L45 5"
                stroke="black"
                strokeWidth="4"
            />
            </svg>
        );
    }

    if (type === "curveRU") {
        return (
            <svg width="50" height="50">
            <path
                d="M25 45
                A20 20 0 0 1 5 25"
                stroke="black"
                strokeWidth="4"
                fill="none"
            />
            <path
                d="M5 25
                L5 5"
                stroke="black"
                strokeWidth="4"
            />
            </svg>
        );
    }

    if (type === "fastHorizontal") {
        return (
            <svg width="50" height="50">
            <line
                x1="5"
                y1="18"
                x2="45"
                y2="18"
                stroke="gold"
                strokeWidth="5"
            />
            <line
                x1="5"
                y1="32"
                x2="45"
                y2="32"
                stroke="gold"
                strokeWidth="5"
            />
            </svg>
        );
    }

    if (type === "fastVertical") {
        return (
            <svg width="50" height="50">
            <line
                x1="18"
                y1="5"
                x2="18"
                y2="45"
                stroke="gold"
                strokeWidth="5"
            />
            <line
                x1="32"
                y1="5"
                x2="32"
                y2="45"
                stroke="gold"
                strokeWidth="5"
            />
            </svg>
        );
    }
  return null;
}
