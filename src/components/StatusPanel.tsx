type Props = {
  targetTime: number;

  totalTime: number;

  isConnected: boolean;

  visitedA: boolean;

  visitedB: boolean;
};

export default function StatusPanel({
  targetTime,
  totalTime,
  isConnected,
  visitedA,
  visitedB,
}: Props) {
  return (
    <>
      <p>
        目標時間: {targetTime}
      </p>

      <p>
        現在時間: {totalTime}
      </p>

      <p>
        {isConnected
          ? "接続OK"
          : "未接続"}
      </p>

      <p>
        A駅:
        {visitedA ? "✓" : "✗"}
      </p>

      <p>
        B駅:
        {visitedB ? "✓" : "✗"}
      </p>
    </>
  );
}
