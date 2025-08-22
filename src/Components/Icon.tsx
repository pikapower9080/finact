import "material-icons/iconfont/filled.css";

export default function Icon({
  className,
  icon,
  noSpace,
  size,
  style
}: {
  className?: string;
  icon: string;
  noSpace?: boolean;
  size?: "tiny";
  style?: React.CSSProperties;
}) {
  let classes = ["material-icons", "md-24", "md-light"];

  if (className) {
    classes = classes.concat(className.split(" "));
  }

  if (noSpace) {
    classes.push("no-space");
  }

  if (size == "tiny") {
    classes.push("md-16");
  }

  return (
    <>
      <i className={classes.join(" ")} style={style || {}}>
        {icon}
      </i>
    </>
  );
}
