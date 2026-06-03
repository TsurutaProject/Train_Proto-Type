import type { TrackType } from "../types";

type Props = {
  selectedTrack: TrackType;

  setSelectedTrack: (
    track: TrackType
  ) => void;

  selectableTracks: TrackType[];
};

export default function Toolbar({
  selectedTrack,
  setSelectedTrack,
  selectableTracks,
}: Props) {
  const getTrackSymbol = (
    type: TrackType
  ) => {
    switch (type) {
      case "horizontal":
        return "━";

      case "vertical":
        return "┃";

      case "curveRD":
        return "┏";

      case "curveLD":
        return "┓";

      case "curveRU":
        return "┗";

      case "curveLU":
        return "┛";

      case "fastHorizontal":
        return "═";

      case "fastVertical":
        return "║";

      default:
        return "";
    }
  };

  return (
    <div className="toolbar">
      {selectableTracks.map(
        (track) => (
          <button
            key={track}
            className={
              selectedTrack === track
                ? "selected"
                : ""
            }
            onClick={() =>
              setSelectedTrack(track)
            }
          >
            {getTrackSymbol(track)}
          </button>
        )
      )}
    </div>
  );
}