export default function Icon(props) {
  let classes = ["material-icons", "md-24", "md-light"];

  if (props.className) {
    classes = classes.concat(props.className.split(" "));
  }

  if (props.noSpace) {
    classes.push("no-space");
  }

  return (
    <>
      <i className={classes.join(" ")}>{props.icon}</i>
    </>
  );
}
