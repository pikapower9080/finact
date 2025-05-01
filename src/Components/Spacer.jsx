export default function Spacer(props) {
  return <div className="spacer" style={{ height: props.height || 0, width: props.width || 0 }} />;
}
