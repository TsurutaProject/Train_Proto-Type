type Props = {
  children: React.ReactNode;
};

export default function GameBoard({
  children,
}: Props) {
  return (
    <div className="grid">
      {children}
    </div>
  );
}
