export default function Spacer({ height = 0, width = 0 }: { height?: number; width?: number }) {
  return <div className="spacer" style={{ height, width }} />;
}
