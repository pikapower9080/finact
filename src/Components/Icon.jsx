import "material-icons/iconfont/filled.css";

export default function Icon(props) {
  let classes = ["material-icons", "md-24", "md-light"];

  if (props.className) {
    classes = classes.concat(props.className.split(" "));
  }

  if (props.noSpace) {
    classes.push("no-space");
  }

  if (props.size == "tiny") {
    classes.push("md-16");
  }

  return (
    <>
      <i className={classes.join(" ")} style={props.style || {}}>
        {props.icon}
      </i>
    </>
  );
}
